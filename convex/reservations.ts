import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const createReservation = mutation({
  args: {
    establishment_id: v.id("establishments"),
    customer_name: v.optional(v.string()),
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    date: v.string(), // ISO "YYYY-MM-DD"
    start_time: v.string(), // "HH:mm"
    guests: v.number(),
    table_id: v.optional(v.id("tables")),
    notes: v.optional(v.string()),
    source: v.union(v.literal("dashboard"), v.literal("whatsapp"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    let customerId: Id<"customers"> | undefined = undefined;

    // Create or find customer if customer information is provided
    if (args.customer_name && (args.customer_phone || args.customer_email)) {
      // Try to find existing customer by phone first
      if (args.customer_phone) {
        const existingCustomer = await ctx.db
          .query("customers")
          .filter((q) => q.eq(q.field("phone"), args.customer_phone!))
          .first();

        if (existingCustomer && existingCustomer.establishments_id.includes(args.establishment_id)) {
          // Update existing customer
          await ctx.db.patch(existingCustomer._id, {
            name: args.customer_name,
            email: args.customer_email || existingCustomer.email,
            last_visit: Date.now(),
            total_visits: existingCustomer.total_visits + 1,
            source: "reservation",
          });
          customerId = existingCustomer._id;
        }
      }

      // If no existing customer found, create new one
      if (!customerId) {
        customerId = await ctx.db.insert("customers", {
          establishments_id: [args.establishment_id],
          name: args.customer_name,
          phone: args.customer_phone,
          email: args.customer_email,
          points: 0,
          tags: [],
          preferred_payment_method: undefined,
          birth_date: undefined,
          anniversary: undefined,
          last_visit: Date.now(),
          total_visits: 1,
          total_spent: 0,
          average_ticket: 0,
          preferred_table: args.table_id,
          allergens: [],
          notes: args.notes,
          source: "reservation",
          created_at: Date.now(),
        });
      }
    }

    const reservationId = await ctx.db.insert("reservations", {
      establishment_id: args.establishment_id,
      customer_id: customerId,
      customer_name: args.customer_name,
      customer_phone: args.customer_phone,
      customer_email: args.customer_email,
      date: args.date,
      start_time: args.start_time,
      guests: args.guests,
      table_id: args.table_id,
      notes: args.notes,
      source: args.source,
      status: "pending",
      notified: false,
      reminder_sent: false,
      created_at: Date.now(),
    });

    await ctx.db.insert("event_log", {
      establishment_id: args.establishment_id,
      type: "operational",
      level: "info",
      actor: "system",
      action: "Nueva Reserva",
      entity_type: "reservation",
      entity_id: reservationId,
      after: {
        customer_name: args.customer_name || "Sin nombre",
        guests: args.guests,
        table_id: args.table_id || "Sin asignar",
        reservation_time: `${args.date} ${args.start_time}`,
        source: args.source,
      },
      timestamp: Date.now(),
    });

    return reservationId;
  },
});

export const getReservations = query({
  args: {
    establishment_id: v.id("establishments"),
    date: v.string(), // ISO "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_establishment", (q) => 
        q.eq("establishment_id", args.establishment_id)
      )
      .collect();

    // Filtrar por fecha
    const filteredReservations = reservations.filter(
      (reservation) => reservation.date === args.date
    );

    // Add environment information for reservations that have table_id
    const reservationsWithEnvironment = await Promise.all(
      filteredReservations.map(async (reservation) => {
        if (reservation.table_id) {
          const table = await ctx.db.get(reservation.table_id);
          if (table) {
            return {
              ...reservation,
              environmentId: table.environment_id,
            };
          }
        }
        return {
          ...reservation,
          environmentId: undefined,
        };
      })
    );

    return reservationsWithEnvironment;
  },
});

export const getAvailableTables = query({
  args: {
    establishment_id: v.id("establishments"),
    date: v.string(),
    start_time: v.string(),
    guests: v.number(),
  },
  handler: async (ctx, args) => {
    // Obtener todas las mesas del establecimiento
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_establishment", (q) => 
        q.eq("establishment_id", args.establishment_id)
      )
      .collect();

    const allTables = [];
    for (const environment of environments) {
      const tables = await ctx.db
        .query("tables")
        .withIndex("by_environment", (q) => 
          q.eq("environment_id", environment._id)
        )
        .collect();
      
      allTables.push(...tables.map(table => ({
        ...table,
        environment_name: environment.name,
      })));
    }

    // Filtrar mesas con capacidad suficiente
    const suitableTables = allTables.filter(table => table.capacity >= args.guests);

    // Obtener reservas existentes para esa fecha y hora
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_establishment", (q) => 
        q.eq("establishment_id", args.establishment_id)
      )
      .collect();
    
    // Filtrar por fecha
    const existingReservations = reservations.filter(
      (reservation: any) => reservation.date === args.date
    );

    // Verificar conflictos de horario (misma mesa, mismo start_time)
    const availableTables = suitableTables.filter(table => {
      const hasConflict = existingReservations.some((reservation: any) => {
        if (reservation.table_id === table._id && reservation.status !== "cancelled") {
          // Sin end_time, solo comprobamos si coincide el start_time
          return reservation.start_time === args.start_time;
        }
        return false;
      });

      return !hasConflict;
    });

    return availableTables;
  },
});

export const getEnvironments = query({
  args: {
    establishment_id: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_establishment", (q) => 
        q.eq("establishment_id", args.establishment_id)
      )
      .collect();

    return environments;
  },
});

export const getTablesByEnvironment = query({
  args: {
    environment_id: v.id("environments"),
  },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_environment", (q) => 
        q.eq("environment_id", args.environment_id)
      )
      .collect();

    return tables;
  },
});

export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("no_show")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reservationId, {
      status: args.status,
    });

    return args.reservationId;
  },
});

export const updateReservation = mutation({
  args: {
    reservation_id: v.id("reservations"),
    customer_name: v.optional(v.string()),
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    date: v.optional(v.string()),
    start_time: v.optional(v.string()),
    guests: v.optional(v.number()),
    table_id: v.optional(v.id("tables")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the existing reservation to check if customer information is changing
    const existingReservation = await ctx.db.get(args.reservation_id);
    if (!existingReservation) {
      throw new Error("Reservation not found");
    }

    const updateData: any = {};
    
    if (args.customer_name !== undefined) updateData.customer_name = args.customer_name;
    if (args.customer_phone !== undefined) updateData.customer_phone = args.customer_phone;
    if (args.customer_email !== undefined) updateData.customer_email = args.customer_email;
    if (args.date !== undefined) updateData.date = args.date;
    if (args.start_time !== undefined) updateData.start_time = args.start_time;
    if (args.guests !== undefined) updateData.guests = args.guests;
    if (args.table_id !== undefined) updateData.table_id = args.table_id;
    if (args.notes !== undefined) updateData.notes = args.notes;

    // Update reservation
    await ctx.db.patch(args.reservation_id, updateData);

    // Handle customer updates if customer information is provided
    if (args.customer_name && (args.customer_phone || args.customer_email)) {
      let customerId = existingReservation.customer_id;

      // If reservation has no customer_id, try to find existing customer or create new one
      if (!customerId) {
        if (args.customer_phone) {
          const existingCustomer = await ctx.db
            .query("customers")
            .filter((q) => q.eq(q.field("phone"), args.customer_phone!))
            .first();

          if (existingCustomer && existingCustomer.establishments_id.includes(existingReservation.establishment_id)) {
            customerId = existingCustomer._id;
          }
        }

        // Create new customer if not found
        if (!customerId) {
          customerId = await ctx.db.insert("customers", {
            establishments_id: [existingReservation.establishment_id],
            name: args.customer_name,
            phone: args.customer_phone,
            email: args.customer_email,
            points: 0,
            tags: [],
            preferred_payment_method: undefined,
            birth_date: undefined,
            anniversary: undefined,
            last_visit: Date.now(),
            total_visits: 1,
            total_spent: 0,
            average_ticket: 0,
            preferred_table: args.table_id || existingReservation.table_id,
            allergens: [],
            notes: args.notes,
            source: "reservation",
            created_at: Date.now(),
          });
        }

        // Update reservation with customer_id
        await ctx.db.patch(args.reservation_id, { customer_id: customerId });
      } else {
        // Update existing customer
        const customerUpdateData: any = {};
        if (args.customer_name !== undefined) customerUpdateData.name = args.customer_name;
        if (args.customer_phone !== undefined) customerUpdateData.phone = args.customer_phone;
        if (args.customer_email !== undefined) customerUpdateData.email = args.customer_email;
        if (args.table_id !== undefined) customerUpdateData.preferred_table = args.table_id;
        if (args.notes !== undefined) customerUpdateData.notes = args.notes;

        if (Object.keys(customerUpdateData).length > 0) {
          await ctx.db.patch(customerId, customerUpdateData);
        }
      }
    }

    return args.reservation_id;
  },
});

export const getReservationsByMonth = query({
  args: {
    establishment_id: v.id("establishments"),
    year: v.number(),
    month: v.number(), // 0-11 (January = 0)
  },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_establishment", (q) => 
        q.eq("establishment_id", args.establishment_id)
      )
      .collect();

    // Filtrar por mes y año
    const filteredReservations = reservations.filter(
      (reservation) => {
        const reservationDate = new Date(reservation.date);
        return reservationDate.getFullYear() === args.year && 
               reservationDate.getMonth() === args.month;
      }
    );

    // Agrupar por día
    const reservationsByDay: Record<string, number> = {};
    filteredReservations.forEach(reservation => {
      const day = reservation.date; // "YYYY-MM-DD"
      reservationsByDay[day] = (reservationsByDay[day] || 0) + 1;
    });

    return reservationsByDay;
  },
});

// Función auxiliar para convertir tiempo "HH:mm" a minutos
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}


// =============================================================================
// Reminder system: query upcoming reservations that need a reminder
// =============================================================================

export const getReservationsForReminder = query({
  args: {
    establishmentId: v.id("establishments"),
    currentDate: v.string(),     // "YYYY-MM-DD" (today)
    currentTimeMin: v.number(),  // Current time in minutes from midnight
  },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    // Filter: today's date, confirmed/pending, not yet reminded,
    // and start_time is between 55-65 minutes from now
    return reservations.filter((r) => {
      if (r.date !== args.currentDate) return false;
      if (r.reminder_sent) return false;
      if (r.status !== "confirmed" && r.status !== "pending") return false;
      if (!r.customer_phone) return false; // Can't send without phone

      const reservationMinutes = parseTime(r.start_time);
      const minutesUntil = reservationMinutes - args.currentTimeMin;

      // Send reminder when reservation is 55-65 minutes away
      return minutesUntil >= 55 && minutesUntil <= 65;
    });
  },
});

export const markReminderSent = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reservationId, { reminder_sent: true });
  },
});
