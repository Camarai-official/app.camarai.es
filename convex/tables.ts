import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// =============================================================================
// Table lifecycle mutations for QR-based ordering
// =============================================================================

/**
 * Helper: parse "HH:mm" to minutes since midnight.
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Get the reservation_buffer_minutes for an establishment (from settings).
 * Defaults to 60 if not configured.
 */
async function getBufferMinutes(
  ctx: any,
  establishmentId: any
): Promise<number> {
  const settings = await ctx.db
    .query("establishment_settings")
    .withIndex("by_establishment", (q: any) =>
      q.eq("establishment_id", establishmentId)
    )
    .unique();

  return settings?.table_settings?.reservation_buffer_minutes ?? 60;
}

/**
 * Find the next upcoming confirmed/pending reservation for a specific table
 * within the buffer window.
 *
 * Returns the reservation doc or null.
 */
async function findUpcomingReservation(
  ctx: any,
  tableId: any,
  establishmentId: any,
  bufferMinutes: number
): Promise<any | null> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const windowEnd = currentMinutes + bufferMinutes;

  const reservations = await ctx.db
    .query("reservations")
    .withIndex("by_establishment", (q: any) =>
      q.eq("establishment_id", establishmentId)
    )
    .collect();

  // Find reservations for this table, today, within the buffer window
  const upcoming = reservations.filter((r: any) => {
    if (r.table_id !== tableId) return false;
    if (r.date !== todayStr) return false;
    if (r.status !== "confirmed" && r.status !== "pending") return false;

    const startMinutes = parseTime(r.start_time);
    // Reservation starts within the buffer window from now
    return startMinutes >= currentMinutes && startMinutes <= windowEnd;
  });

  if (upcoming.length === 0) return null;

  // Return the earliest one
  upcoming.sort(
    (a: any, b: any) => parseTime(a.start_time) - parseTime(b.start_time)
  );
  return upcoming[0];
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Get a table by its number within an establishment.
 * Searches across all environments.
 */
export const getTableByNumber = query({
  args: {
    establishmentId: v.id("establishments"),
    tableNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    for (const env of environments) {
      const tables = await ctx.db
        .query("tables")
        .withIndex("by_environment", (q) =>
          q.eq("environment_id", env._id)
        )
        .collect();

      const match = tables.find((t) => t.number === args.tableNumber);
      if (match) {
        return { ...match, environment_name: env.name };
      }
    }

    return null;
  },
});

/**
 * Check if a table has an upcoming reservation within the buffer window.
 */
export const getUpcomingReservation = query({
  args: {
    tableId: v.id("tables"),
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const bufferMinutes = await getBufferMinutes(ctx, args.establishmentId);
    return await findUpcomingReservation(
      ctx,
      args.tableId,
      args.establishmentId,
      bufferMinutes
    );
  },
});

/**
 * Get the system staff ID for an establishment (role = "system").
 * Used by the customer agent to create orders without a human staff member.
 */
export const getSystemStaffId = query({
  args: {
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    const systemStaff = staff.find((s) => s.role === "system");
    return systemStaff?._id ?? null;
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Normalize a phone number for comparison: strip +, spaces, dashes.
 * Keeps only digits. Returns last 9 digits for Spanish numbers.
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  // Spanish numbers: compare last 9 digits (drop country code 34)
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

/**
 * Occupy or join a table from a QR scan.
 *
 * Three scenarios:
 * - free    → create session, mark occupied (first customer)
 * - reserved → same as free + complete matching reservation
 * - occupied → join existing session (add phone to clients)
 * - dirty   → rejected (table not ready)
 *
 * Returns: { tableId, tableNumber, sessionId, sessionCode, previousStatus,
 *            joined, deviceCount, reservation? }
 */
export const occupyFromQR = mutation({
  args: {
    tableId: v.id("tables"),
    establishmentId: v.id("establishments"),
    customerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Mesa no encontrada");

    if (table.status === "dirty") {
      throw new Error(
        `La mesa ${table.number} está pendiente de limpieza. Avisa a un camarero.`
      );
    }

    if (
      table.status !== "free" &&
      table.status !== "reserved" &&
      table.status !== "occupied"
    ) {
      throw new Error(
        `La mesa ${table.number} no está disponible (estado: ${table.status})`
      );
    }

    const previousStatus = table.status;

    // ── OCCUPIED: join existing session ─────────────────────────
    if (previousStatus === "occupied") {
      // Find the active session for this table
      const activeSessions = await ctx.db
        .query("table_sessions")
        .withIndex("by_table_status", (q) =>
          q.eq("table_id", args.tableId).eq("status", "active")
        )
        .collect();

      if (activeSessions.length === 0) {
        throw new Error("Mesa ocupada pero sin sesión activa. Avisa a un camarero.");
      }

      const session = activeSessions[0];
      const clients: string[] = session.clients ?? [];

      // Check capacity: 1 device per guest (if guest count already set)
      if (
        session.guests &&
        args.customerPhone &&
        !clients.includes(args.customerPhone) &&
        clients.length >= session.guests
      ) {
        throw new Error(
          `La mesa ${table.number} ya tiene ${clients.length}/${session.guests} dispositivos conectados. No se admiten más.`
        );
      }

      // Add phone to clients if not already there
      if (args.customerPhone && !clients.includes(args.customerPhone)) {
        clients.push(args.customerPhone);
        await ctx.db.patch(session._id, {
          clients,
          updated_at: Date.now(),
        });
      }

      // Audit
      await ctx.db.insert("event_log", {
        establishment_id: args.establishmentId,
        type: "operational",
        level: "info",
        actor: "system",
        action: "TABLE_JOINED_QR",
        entity_type: "tables",
        entity_id: args.tableId,
        after: {
          table_number: table.number,
          customer_phone: args.customerPhone,
          device_count: clients.length,
        },
        timestamp: Date.now(),
      });

      return {
        tableId: args.tableId,
        tableNumber: table.number,
        sessionId: session._id,
        sessionCode: session.session_code,
        previousStatus,
        joined: true,
        deviceCount: clients.length,
        currentOrderId: table.current_order_id ?? null,
        reservation: null,
      };
    }

    // ── FREE / RESERVED: first occupation ───────────────────────
    let reservationInfo: {
      customerName?: string;
      startTime?: string;
      guests?: number;
      phoneMatch: boolean;
    } | null = null;

    // If table was reserved, find the reservation and check phone
    if (previousStatus === "reserved") {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      const reservations = await ctx.db
        .query("reservations")
        .withIndex("by_establishment", (q) =>
          q.eq("establishment_id", args.establishmentId)
        )
        .collect();

      const matchingReservation = reservations.find((r) => {
        if (r.table_id !== args.tableId) return false;
        if (r.date !== todayStr) return false;
        return r.status === "confirmed" || r.status === "pending";
      });

      if (matchingReservation) {
        let phoneMatch = false;
        if (args.customerPhone && matchingReservation.customer_phone) {
          const scannerPhone = normalizePhone(args.customerPhone);
          const reservationPhone = normalizePhone(
            matchingReservation.customer_phone
          );
          phoneMatch =
            scannerPhone === reservationPhone && scannerPhone.length > 0;
        }

        await ctx.db.patch(matchingReservation._id, {
          status: "completed",
        });

        reservationInfo = {
          customerName: matchingReservation.customer_name,
          startTime: matchingReservation.start_time,
          guests: matchingReservation.guests,
          phoneMatch,
        };
      }
    }

    // Create table session
    const sessionCode = `TABLE-${table.number}-${Date.now().toString().slice(-6)}`;
    const sessionId = await ctx.db.insert("table_sessions", {
      table_id: args.tableId,
      session_code: sessionCode,
      status: "active",
      start_time: Date.now(),
      clients: args.customerPhone ? [args.customerPhone] : [],
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Mark table as occupied
    await ctx.db.patch(args.tableId, {
      status: "occupied",
    });

    // Audit log
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: reservationInfo && !reservationInfo.phoneMatch ? "warning" : "info",
      actor: "system",
      action: "TABLE_OCCUPIED_QR",
      entity_type: "tables",
      entity_id: args.tableId,
      after: {
        table_number: table.number,
        previous_status: previousStatus,
        session_code: sessionCode,
        customer_phone: args.customerPhone,
        reservation_phone_match: reservationInfo?.phoneMatch ?? null,
        reservation_customer: reservationInfo?.customerName ?? null,
      },
      timestamp: Date.now(),
    });

    return {
      tableId: args.tableId,
      tableNumber: table.number,
      sessionId,
      sessionCode,
      previousStatus,
      joined: false,
      deviceCount: 1,
      currentOrderId: null,
      reservation: reservationInfo,
    };
  },
});

/**
 * Mark a table as clean (staff action from dashboard).
 *
 * Transitions: dirty → free (no upcoming reservation)
 *              dirty → reserved (upcoming reservation within buffer)
 *
 * Returns: { newStatus, upcomingReservation? }
 */
export const markTableClean = mutation({
  args: {
    tableId: v.id("tables"),
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Mesa no encontrada");

    if (table.status !== "dirty") {
      throw new Error(
        `Solo se pueden limpiar mesas en estado 'dirty' (estado actual: ${table.status})`
      );
    }

    // Check for upcoming reservation within buffer window
    const bufferMinutes = await getBufferMinutes(ctx, args.establishmentId);
    const upcoming = await findUpcomingReservation(
      ctx,
      args.tableId,
      args.establishmentId,
      bufferMinutes
    );

    const newStatus = upcoming ? "reserved" : "free";

    await ctx.db.patch(args.tableId, {
      status: newStatus,
    });

    // Close any remaining active table sessions
    const activeSessions = await ctx.db
      .query("table_sessions")
      .withIndex("by_table_status", (q) =>
        q.eq("table_id", args.tableId).eq("status", "active")
      )
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        status: "closed",
        end_time: Date.now(),
        updated_at: Date.now(),
      });
    }

    // Audit log
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: "info",
      actor: "system",
      action: "TABLE_CLEANED",
      entity_type: "tables",
      entity_id: args.tableId,
      after: {
        table_number: table.number,
        new_status: newStatus,
        upcoming_reservation: upcoming
          ? {
              customer_name: upcoming.customer_name,
              start_time: upcoming.start_time,
              guests: upcoming.guests,
            }
          : null,
      },
      timestamp: Date.now(),
    });

    return {
      newStatus,
      upcomingReservation: upcoming
        ? {
            customerName: upcoming.customer_name,
            startTime: upcoming.start_time,
            guests: upcoming.guests,
          }
        : null,
    };
  },
});

/**
 * Get the current status of a table with context.
 * Includes active session info and any upcoming reservations.
 */
export const getTableStatus = query({
  args: {
    tableId: v.id("tables"),
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) return null;

    // Get active sessions
    const activeSessions = await ctx.db
      .query("table_sessions")
      .withIndex("by_table_status", (q) =>
        q.eq("table_id", args.tableId).eq("status", "active")
      )
      .collect();

    // Get upcoming reservations
    const bufferMinutes = await getBufferMinutes(ctx, args.establishmentId);
    const upcoming = await findUpcomingReservation(
      ctx,
      args.tableId,
      args.establishmentId,
      bufferMinutes
    );

    // Get current order if any
    const currentOrder = table.current_order_id
      ? await ctx.db.get(table.current_order_id)
      : null;

    return {
      tableId: table._id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      activeSessions: activeSessions.length,
      currentOrder: currentOrder
        ? {
            orderId: currentOrder._id,
            orderNumber: currentOrder.order_number,
            totalAmount: currentOrder.total_amount,
            guests: currentOrder.guests,
          }
        : null,
      upcomingReservation: upcoming
        ? {
            reservationId: upcoming._id,
            customerName: upcoming.customer_name,
            startTime: upcoming.start_time,
            guests: upcoming.guests,
          }
        : null,
    };
  },
});

/**
 * Set the guest count on an active table session.
 * Called by the customer agent after the first phone answers "¿cuántos sois?".
 * This sets the device limit (1 phone per guest).
 */
export const setSessionGuests = mutation({
  args: {
    sessionId: v.id("table_sessions"),
    guests: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Sesión no encontrada");
    if (session.status !== "active") {
      throw new Error("La sesión ya no está activa");
    }

    await ctx.db.patch(args.sessionId, {
      guests: args.guests,
      updated_at: Date.now(),
    });

    return { ok: true, guests: args.guests };
  },
});

/**
 * Store a client's allergens on the table session.
 * Called after each phone declares their allergens.
 * Used for cross-warnings when ordering (e.g. "this dish has gluten
 * and another diner at your table is intolerant to gluten").
 *
 * client_allergens is a map: { phone: allergens[] }
 */
export const setClientAllergens = mutation({
  args: {
    sessionId: v.id("table_sessions"),
    phone: v.string(),
    allergens: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Sesión no encontrada");
    if (session.status !== "active") {
      throw new Error("La sesión ya no está activa");
    }

    const existing: Record<string, string[]> =
      (session.client_allergens as Record<string, string[]>) ?? {};
    existing[args.phone] = args.allergens;

    await ctx.db.patch(args.sessionId, {
      client_allergens: existing,
      updated_at: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Get all client allergens for a table session.
 * Returns a map: { phone: allergens[] }
 */
export const getTableAllergens = query({
  args: {
    sessionId: v.id("table_sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return {};
    return (session.client_allergens as Record<string, string[]>) ?? {};
  },
});

// =============================================================================
// Testing helper — reset table to free (dev only)
// =============================================================================

export const resetTableForTesting = mutation({
  args: {
    tableId: v.id("tables"),
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Mesa no encontrada");

    // Set table to free
    await ctx.db.patch(args.tableId, {
      status: "free",
      current_order_id: undefined,
    });

    // Close any active sessions
    const activeSessions = await ctx.db
      .query("table_sessions")
      .withIndex("by_table_status", (q) =>
        q.eq("table_id", args.tableId).eq("status", "active")
      )
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        status: "closed",
        end_time: Date.now(),
        updated_at: Date.now(),
      });
    }

    return { reset: true, closedSessions: activeSessions.length };
  },
});
