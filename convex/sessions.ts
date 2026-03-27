import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Genera un código de sesión único para una mesa (Equivalente a generar_codigo_sesion en SQL)
 */
export const createTableSession = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Mesa no encontrada");

    // Generamos el código único: MESA_{id}_{fecha}_{secuencia}
    const sessionCode = `TABLE-${table.number}-${Date.now().toString().slice(-4)}`;

    const sessionId = await ctx.db.insert("table_sessions", {
      table_id: args.tableId,
      session_code: sessionCode,
      status: "active",
      start_time: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Actualizamos el estado de la mesa a ocupada
    await ctx.db.patch(args.tableId, {
      status: "occupied",
    });

    return { sessionId, sessionCode };
  },
});

/**
 * Cierra una sesión de mesa (Equivalente a cerrar_sesion_mesa en SQL)
 */
export const closeTableSession = mutation({
  args: { sessionId: v.id("table_sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status === "closed") return;

    // 1. Cerramos la sesión
    await ctx.db.patch(args.sessionId, {
      status: "closed",
      end_time: Date.now(),
      updated_at: Date.now(),
    });

    // 2. Liberamos la mesa si no hay más sesiones activas (Paridad con SQL)
    const otherActiveSessions = await ctx.db
      .query("table_sessions")
      .withIndex("by_table_status", (q) => 
        q.eq("table_id", session.table_id).eq("status", "active")
      )
      .collect();

    if (otherActiveSessions.length === 0) {
      await ctx.db.patch(session.table_id, {
        status: "free",
        current_order_id: undefined,
      });
    }

    return { success: true };
  },
});
