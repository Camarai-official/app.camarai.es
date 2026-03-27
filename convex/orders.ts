import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Recalcula totales de una orden (Equivalente al cálculo en cerrar_pedido_mesa de SQL)
 */
export const recalculateOrderTotals = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;

    const items = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
    
    // Obtenemos el impuesto (simplificado a 10%)
    const taxAmount = Math.round(subtotal * 0.10); 
    const totalAmount = subtotal + taxAmount - (order.discount_amount || 0);

    await ctx.db.patch(args.orderId, {
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      updated_at: Date.now(),
    });
  },
});

/**
 * Crea una nueva orden
 */
export const createOrder = mutation({
  args: {
    establishmentId: v.id("establishments"),
    tableId: v.optional(v.id("tables")),
    staffId: v.id("staff"),
    guests: v.number(),
    source: v.union(v.literal("pos"), v.literal("pda"), v.literal("carta"), v.literal("voice"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    const orderId = await ctx.db.insert("orders", {
      establishment_id: args.establishmentId,
      table_id: args.tableId,
      staff_id: args.staffId,
      order_number: orderNumber,
      status: "open",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_type: "individual",
      source: args.source,
      guests: args.guests,
      is_commission_order: args.source === "carta",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    if (args.tableId) {
      await ctx.db.patch(args.tableId, {
        status: "occupied",
        current_order_id: orderId,
      });
    }

    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: "info",
      actor: args.staffId,
      action: "CREATE_ORDER",
      entity_type: "orders",
      entity_id: orderId,
      timestamp: Date.now(),
    });

    return orderId;
  },
});

/**
 * Cierre de Orden y Registro de Pago
 * (Equivalente al Trigger after_order_paid_stock de SQL)
 */
export const finalizeAndPayOrder = mutation({
  args: { 
    orderId: v.id("orders"),
    method: v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"), v.literal("transfer")),
    tip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status === "paid") throw new Error("Orden no válida o ya pagada");

    // 1. Registro de Pago
    await ctx.db.insert("payments", {
      establishment_id: order.establishment_id,
      order_id: args.orderId,
      method: args.method,
      amount: order.total_amount,
      tip: args.tip || 0,
      staff_id: order.staff_id,
      timestamp: Date.now(),
    });

    // 2. Cerramos la orden
    await ctx.db.patch(args.orderId, {
      status: "paid",
      closed_at: Date.now(),
      updated_at: Date.now(),
    });

    // 3. DISPARADOR DE STOCK (Equivalente al CALL sp_deduct_order_stock de SQL)
    // Se ejecuta de forma asíncrona para no bloquear la respuesta del POS
    await ctx.scheduler.runAfter(0, internal.inventory.deductStockFromOrder, {
      orderId: args.orderId
    });

    // 4. Liberamos la mesa a estado 'dirty'
    if (order.table_id) {
      await ctx.db.patch(order.table_id, {
        status: "dirty",
        current_order_id: undefined,
      });
    }

    // Auditoría
    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "financial",
      level: "info",
      actor: order.staff_id,
      action: "ORDER_FINALIZED",
      entity_type: "orders",
      entity_id: args.orderId,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
