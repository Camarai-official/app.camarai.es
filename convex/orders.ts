import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Queries para Orders

export const getRecentOrders = query({
  args: {
    establishmentId: v.id("establishments"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_establishment_created", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .order("desc")
      .take(limit);

    // Get table and staff details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const table = order.table_id ? await ctx.db.get(order.table_id) : null;
        const staff = await ctx.db.get(order.staff_id);
        
        return {
          id: order._id,
          orderNumber: order.order_number,
          created_at: order.created_at,
          tableLabel: table?.label || "Sin mesa",
          staffName: staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Unknown",
          totalAmount: order.total_amount,
          status: order.status,
        };
      })
    );

    return ordersWithDetails;
  },
});

/**
 * Helper: Agregar orderId al array orders del ambiente (evita duplicados)
 */
async function addOrderToEnvironment(
  ctx: MutationCtx,
  tableId: Id<"tables">,
  orderId: Id<"orders">
) {
  const table = await ctx.db.get(tableId);
  if (!table) return;

  const environment = await ctx.db.get(table.environment_id);
  if (!environment) return;

  const currentOrders = environment.orders || [];
  if (!currentOrders.includes(orderId)) {
    await ctx.db.patch(table.environment_id, {
      orders: [...currentOrders, orderId],
    });
  }
}

/**
 * Helper: Remover orderId del array orders del ambiente
 */
async function removeOrderFromEnvironment(
  ctx: MutationCtx,
  tableId: Id<"tables">,
  orderId: Id<"orders">
) {
  const table = await ctx.db.get(tableId);
  if (!table) return;

  const environment = await ctx.db.get(table.environment_id);
  if (!environment || !environment.orders) return;

  const updatedOrders = environment.orders.filter((id) => id !== orderId);
  if (updatedOrders.length < environment.orders.length) {
    await ctx.db.patch(table.environment_id, {
      orders: updatedOrders,
    });
  }
}

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

      await addOrderToEnvironment(ctx, args.tableId, orderId);
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

    // 3. ACTUALIZACIÓN DE KPIs (HyperFast - Pre-aggregado)
    // Actualiza los totales incrementales sin escanear la tabla de órdenes
    await ctx.scheduler.runAfter(0, internal.kpis.updateKPIsOnOrderPaid, {
      establishmentId: order.establishment_id,
      orderAmount: order.total_amount,
      orderCreatedAt: order.created_at,
      orderClosedAt: Date.now(),
      isCommissionOrder: order.is_commission_order,
    });

    // 4. DISPARADOR DE STOCK (Equivalente al CALL sp_deduct_order_stock de SQL)
    // Se ejecuta de forma asíncrona para no bloquear la respuesta del POS
    await ctx.scheduler.runAfter(0, internal.inventory.deductStockFromOrder, {
      orderId: args.orderId
    });

    // 5. Liberamos la mesa a estado 'dirty' y removemos del ambiente
    if (order.table_id) {
      await ctx.db.patch(order.table_id, {
        status: "dirty",
        current_order_id: undefined,
      });

      await removeOrderFromEnvironment(ctx, order.table_id, args.orderId);
    }

    // Auditoría - Evento de pago recibido
    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "financial",
      level: "info",
      actor: order.staff_id || "system",
      action: "Pago Recibido",
      entity_type: "payment",
      entity_id: args.orderId,
      after: { 
        payment_method: args.method,
        total_amount: order.total_amount,
        tip: args.tip || 0,
        table_number: order.table_id ? `Mesa ${order.table_id}` : "Para llevar"
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cancela una orden y limpia la mesa y el ambiente
 */
export const cancelOrder = mutation({
  args: { 
    orderId: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (order.status !== "open") throw new Error("Solo se pueden cancelar órdenes abiertas");

    // 1. Marcar orden como cancelada
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      closed_at: Date.now(),
      updated_at: Date.now(),
    });

    // 2. Liberar mesa y limpiar del ambiente
    if (order.table_id) {
      await ctx.db.patch(order.table_id, {
        status: "free",
        current_order_id: undefined,
      });

      await removeOrderFromEnvironment(ctx, order.table_id, args.orderId);
    }

    // 3. Auditoría
    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "operational",
      level: "warning",
      actor: order.staff_id,
      action: "ORDER_CANCELLED",
      entity_type: "orders",
      entity_id: args.orderId,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Agrega un item a una orden existente
 * EJEMPLO DE REFACTORIZACIÓN: Integración con KPIs pre-agregados
 */
export const addOrderItem = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
    variant: v.optional(v.string()),
    notes: v.optional(v.string()),
    course: v.union(v.literal("first"), v.literal("second"), v.literal("dessert"), v.literal("drink")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (order.status !== "open") throw new Error("Solo se pueden agregar items a órdenes abiertas");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Producto no encontrado");

    const totalPrice = args.unitPrice * args.quantity;

    // 1. Insertar el item
    const itemId = await ctx.db.insert("order_items", {
      order_id: args.orderId,
      product_id: args.productId,
      product_name: product.name,
      quantity: args.quantity,
      unit_price: args.unitPrice,
      total_price: totalPrice,
      variant: args.variant,
      notes: args.notes,
      course: args.course,
      item_status: "pending",
    });

    // 2. Recalcular totales de la orden
    await ctx.scheduler.runAfter(0, internal.orders.recalculateOrderTotals, {
      orderId: args.orderId,
    });

    // 3. ACTUALIZACIÓN KPI - Items vendidos (HyperFast)
    // Actualiza el contador de productos vendidos incrementalmente
    await ctx.scheduler.runAfter(0, internal.kpis.updateKPIsOnItemsAdded, {
      establishmentId: order.establishment_id,
      itemQuantity: args.quantity,
      orderCreatedAt: order.created_at,
    });

    // 4. Auditoría
    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "operational",
      level: "info",
      actor: order.staff_id,
      action: "ITEM_ADDED",
      entity_type: "order_items",
      entity_id: itemId,
      after: {
        product_name: product.name,
        quantity: args.quantity,
        unit_price: args.unitPrice,
        total_price: totalPrice,
        course: args.course,
      },
      timestamp: Date.now(),
    });

    return { itemId, totalPrice };
  },
});

// =============================================================================
// PUBLIC MUTATION: Create order from the web carta (camarai_menu-privado)
// =============================================================================

/**
 * Create a full order from the web menu app.
 *
 * Resolves session → table → environment → establishment internally.
 * Uses the "system" staff member as the actor.
 *
 * Args:
 *   sessionId: table_session ID
 *   items: [{ productId, quantity, variant?, notes? }]
 */
export const createOrderFromCarta = mutation({
  args: {
    sessionId: v.id("table_sessions"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        variant: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new Error("El pedido no tiene items");
    }

    // 1. Resolve session → table → environment → establishment
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      throw new Error("Sesión no encontrada o cerrada");
    }

    const table = await ctx.db.get(session.table_id);
    if (!table) throw new Error("Mesa no encontrada");

    const environment = await ctx.db.get(table.environment_id);
    if (!environment) throw new Error("Entorno no encontrado");

    const establishmentId = environment.establishment_id;

    // 2. Get system staff (for automated orders)
    const systemStaff = await ctx.db
      .query("staff")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", establishmentId)
      )
      .filter((q) => q.eq(q.field("role"), "system"))
      .first();

    if (!systemStaff) {
      throw new Error("No hay staff de sistema configurado");
    }

    // 3. Create the order
    const orderNumber = `CARTA-${Date.now().toString().slice(-6)}`;
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      establishment_id: establishmentId,
      table_id: table._id,
      staff_id: systemStaff._id,
      order_number: orderNumber,
      status: "open",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_type: "individual",
      source: "carta",
      guests: session.guests || 1,
      is_commission_order: true,
      created_at: now,
      updated_at: now,
    });

    // Update table with current order
    await ctx.db.patch(table._id, {
      current_order_id: orderId,
    });

    await addOrderToEnvironment(ctx, table._id, orderId);

    // 4. Add each item
    let subtotal = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.active) continue;

      // Determine unit price (handle variants)
      let unitPrice = product.price;
      let variantName = item.variant;

      if (variantName && product.variants) {
        const variant = product.variants.find(
          (v: any) => v.nombre === variantName || v.id === variantName
        );
        if (variant) {
          unitPrice = product.price + variant.precio_extra;
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      // Determine course from category
      const category = await ctx.db.get(product.category_id);
      const categoryName = category?.name?.toLowerCase() || "";
      let course: "first" | "second" | "dessert" | "drink" = "first";
      if (categoryName.includes("postre") || categoryName.includes("dessert")) {
        course = "dessert";
      } else if (categoryName.includes("bebida") || categoryName.includes("drink")) {
        course = "drink";
      } else if (categoryName.includes("carne") || categoryName.includes("pescado") || categoryName.includes("principal")) {
        course = "second";
      }

      await ctx.db.insert("order_items", {
        order_id: orderId,
        product_id: item.productId,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        variant: variantName,
        notes: item.notes,
        course,
        item_status: "pending",
      });
    }

    // 5. Recalculate totals
    await ctx.scheduler.runAfter(0, internal.orders.recalculateOrderTotals, {
      orderId,
    });

    // 6. Event log
    await ctx.db.insert("event_log", {
      establishment_id: establishmentId,
      type: "operational",
      level: "info",
      actor: systemStaff._id,
      action: "CREATE_ORDER",
      entity_type: "orders",
      entity_id: orderId,
      timestamp: now,
    });

    return {
      orderId,
      orderNumber,
      itemCount: args.items.length,
      subtotal,
    };
  },
});
