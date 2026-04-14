import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createReservation = mutation({
  args: {
    establishment_id: v.id("establishments"),
    customer_name: v.optional(v.string()),
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    date: v.string(), // ISO "YYYY-MM-DD"
    start_time: v.string(), // "HH:mm"
    end_time: v.string(), // "HH:mm"
    guests: v.number(),
    table_id: v.optional(v.id("tables")),
    notes: v.optional(v.string()),
    source: v.union(v.literal("dashboard"), v.literal("whatsapp"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    // Para clientes invitados, necesitamos crear o encontrar un customer_id válido
    // Por ahora, omitiremos customer_id ya que es opcional según el schema
    const reservationId = await ctx.db.insert("reservations", {
      establishment_id: args.establishment_id,
      customer_name: args.customer_name,
      customer_phone: args.customer_phone,
      customer_email: args.customer_email,
      date: args.date,
      start_time: args.start_time,
      end_time: args.end_time,
      guests: args.guests,
      table_id: args.table_id,
      notes: args.notes,
      source: args.source,
      status: "pending",
      notified: false,
      reminder_sent: false,
      created_at: Date.now(),
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
    end_time: v.string(),
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

    // Verificar conflictos de tiempo
    const availableTables = suitableTables.filter(table => {
      const hasConflict = existingReservations.some((reservation: any) => {
        if (reservation.table_id === table._id && reservation.status !== "cancelled") {
          // Verificar si hay superposición de horarios
          const reservationStart = parseTime(reservation.start_time);
          const reservationEnd = parseTime(reservation.end_time);
          const newStart = parseTime(args.start_time);
          const newEnd = parseTime(args.end_time);

          return (
            (newStart >= reservationStart && newStart < reservationEnd) ||
            (newEnd > reservationStart && newEnd <= reservationEnd) ||
            (newStart <= reservationStart && newEnd >= reservationEnd)
          );
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
    end_time: v.optional(v.string()),
    guests: v.optional(v.number()),
    table_id: v.optional(v.id("tables")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    
    if (args.customer_name !== undefined) updateData.customer_name = args.customer_name;
    if (args.customer_phone !== undefined) updateData.customer_phone = args.customer_phone;
    if (args.customer_email !== undefined) updateData.customer_email = args.customer_email;
    if (args.date !== undefined) updateData.date = args.date;
    if (args.start_time !== undefined) updateData.start_time = args.start_time;
    if (args.end_time !== undefined) updateData.end_time = args.end_time;
    if (args.guests !== undefined) updateData.guests = args.guests;
    if (args.table_id !== undefined) updateData.table_id = args.table_id;
    if (args.notes !== undefined) updateData.notes = args.notes;

    await ctx.db.patch(args.reservation_id, updateData);

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
