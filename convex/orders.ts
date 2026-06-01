import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

/**
 * Query principal para la vista de Comandas (Historial de Pedidos)
 * Soporta filtros de fecha, búsqueda por número de orden y paginación con cursores.
 */
export const getOrdersForComandas = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.optional(v.number()), // timestamp
    endDate: v.optional(v.number()), // timestamp
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let paginatedResults;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      let q = ctx.db
        .query("orders")
        .withSearchIndex("search_order_number", (q) =>
          q.search("order_number", args.searchTerm!).eq("establishment_id", args.establishmentId)
        );
      
      if (args.startDate !== undefined || args.endDate !== undefined) {
         q = q.filter(q => {
            const conditions = [];
            if (args.startDate !== undefined) conditions.push(q.gte(q.field("created_at"), args.startDate));
            if (args.endDate !== undefined) conditions.push(q.lte(q.field("created_at"), args.endDate));
            return q.and(...conditions);
         });
      }
      paginatedResults = await q.paginate(args.paginationOpts);
    } else {
      let q = ctx.db
        .query("orders")
        .withIndex("by_establishment_created", (q) => {
          let filter = q.eq("establishment_id", args.establishmentId);
          return filter;
        });

      if (args.startDate !== undefined || args.endDate !== undefined) {
         q = q.filter(q => {
            const conditions = [];
            if (args.startDate !== undefined) conditions.push(q.gte(q.field("created_at"), args.startDate));
            if (args.endDate !== undefined) conditions.push(q.lte(q.field("created_at"), args.endDate));
            return q.and(...conditions);
         });
      }
      paginatedResults = await q.order("desc").paginate(args.paginationOpts);
    }

    const ordersWithDetails = await Promise.all(
      paginatedResults.page.map(async (order) => {
        const table = order.table_id ? await ctx.db.get(order.table_id as Id<"tables">) : null;
        const staff = await ctx.db.get(order.staff_id as Id<"staff">);
        const customer = order.customer_id ? await ctx.db.get(order.customer_id as Id<"customers">) : null;
        const environment = order.environment_id ? await ctx.db.get(order.environment_id as Id<"environments">) : null;

        return {
          _id: order._id,
          orderNumber: order.order_number,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          closedAt: order.closed_at,
          status: order.status,
          totalAmount: order.total_amount,
          subtotal: order.subtotal,
          taxAmount: order.tax_amount,
          discountAmount: order.discount_amount,
          discountReason: order.discount_reason,
          notes: order.notes,
          paymentType: order.payment_type,
          paymentStatus: order.payment_status,
          orderType: order.order_type,
          source: order.source,
          isRefund: order.is_refund,
          isCommissionOrder: order.is_commission_order,
          guests: order.guests,
          // Table info
          tableId: order.table_id,
          tableLabel: table?.label || table?.number?.toString() || null,
          // Environment info
          environmentId: order.environment_id,
          environmentName: environment?.name || null,
          // Staff info
          staffId: order.staff_id,
          staffName: staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Desconocido",
          // Customer info
          customerId: order.customer_id,
          customerName: customer?.name || null,
          // Delivery info
          deliveryAddress: order.delivery_address,
          deliveryCity: order.delivery_city,
          deliveryPhone: order.delivery_phone,
          trackingCode: order.tracking_code,
        };
      })
    );

    return {
      page: ordersWithDetails,
      isDone: paginatedResults.isDone,
      continueCursor: paginatedResults.continueCursor,
    };
  },
});

export const getOrdersForSession = query({
  args: {
    sessionId: v.id("table_sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return { orders: [], tableNumber: null };

    const table = await ctx.db.get(session.table_id);
    if (!table) return { orders: [], tableNumber: null };

    const environment = await ctx.db.get(table.environment_id);
    if (!environment) return { orders: [], tableNumber: null };

    // Get all orders for this table created during this session
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_establishment_created", (q) =>
        q.eq("establishment_id", environment.establishment_id)
      )
      .order("desc")
      .collect();

    const sessionOrders = allOrders.filter(
      (o) =>
        o.table_id === session.table_id &&
        o.created_at >= session.start_time &&
        o.source === "carta"
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      sessionOrders.map(async (order) => {
        const items = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("order_id", order._id))
          .collect();

        return {
          id: order._id,
          orderNumber: order.order_number,
          status: order.status,
          subtotal: order.subtotal,
          taxAmount: order.tax_amount,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          items: items.map((item) => ({
            id: item._id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            variant: item.variant ?? null,
            notes: item.notes ?? null,
            course: item.course,
            status: item.item_status,
          })),
        };
      })
    );

    return {
      orders: ordersWithItems,
      tableNumber: table.number,
    };
  },
});

/**
 * Query para obtener detalles completos de una orden con sus items
 */
export const getOrderDetails = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Get items
    const items = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    // Get related entities
    const table = order.table_id ? await ctx.db.get(order.table_id) : null;
    const staff = await ctx.db.get(order.staff_id);
    const customer = order.customer_id ? await ctx.db.get(order.customer_id) : null;
    const environment = order.environment_id ? await ctx.db.get(order.environment_id) : null;

    // Get payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    return {
      _id: order._id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      closedAt: order.closed_at,
      status: order.status,
      totalAmount: order.total_amount,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      discountReason: order.discount_reason,
      notes: order.notes,
      paymentType: order.payment_type,
      paymentStatus: order.payment_status,
      orderType: order.order_type,
      source: order.source,
      isRefund: order.is_refund,
      isCommissionOrder: order.is_commission_order,
      guests: order.guests,
      // Table info
      tableId: order.table_id,
      tableLabel: table?.label || table?.number?.toString() || null,
      tableNumber: table?.number || null,
      // Environment info
      environmentId: order.environment_id,
      environmentName: environment?.name || null,
      // Staff info
      staffId: order.staff_id,
      staffName: staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Desconocido",
      // Customer info
      customerId: order.customer_id,
      customerName: customer?.name || null,
      customerPhone: customer?.phone || null,
      customerEmail: customer?.email || null,
      // Items
      items: items.map(item => ({
        _id: item._id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        variant: item.variant,
        notes: item.notes,
        course: item.course,
        itemStatus: item.item_status,
        sentToKitchenAt: item.sent_to_kitchen_at,
        readyAt: item.ready_at,
        clientId: item.client_id,
        paymentStatus: item.payment_status,
        paymentMethod: item.payment_method,
        paidAt: item.paid_at,
      })),
      // Payments
      payments: payments.map(payment => ({
        _id: payment._id,
        method: payment.method,
        amount: payment.amount,
        tip: payment.tip,
        reference: payment.reference,
        staffId: payment.staff_id,
        timestamp: payment.timestamp,
      })),
      // Delivery info
      deliveryAddress: order.delivery_address,
      deliveryPostalCode: order.delivery_postal_code,
      deliveryCity: order.delivery_city,
      deliveryPhone: order.delivery_phone,
      trackingCode: order.tracking_code,
      origenWhatsapp: order.origen_whatsapp,
      metodoPago: order.metodo_pago,
    };
  },
});

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
    
    let environmentId;
    if (args.tableId) {
      const table = await ctx.db.get(args.tableId);
      if (table) {
        environmentId = table.environment_id;
      }
    }

    const orderId = await ctx.db.insert("orders", {
      establishment_id: args.establishmentId,
      table_id: args.tableId,
      environment_id: environmentId,
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
        status: "maintenance",
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
 * Anula productos seleccionados de una orden y crea una nueva orden con los productos restantes
 */
export const partialCancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
    itemIdsToCancel: v.array(v.id("order_items")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (order.status !== "open") throw new Error("Solo se pueden anular productos de órdenes abiertas");

    // Get all items from the order
    const allItems = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    // Identify items to cancel and items to keep
    const itemsToCancel = allItems.filter(item => args.itemIdsToCancel.includes(item._id));
    const itemsToKeep = allItems.filter(item => !args.itemIdsToCancel.includes(item._id));

    if (itemsToCancel.length === 0) throw new Error("No se encontraron productos para anular");
    if (itemsToKeep.length === 0) {
      // If all items are being cancelled, just cancel the whole order
      await ctx.db.patch(args.orderId, {
        status: "cancelled",
        closed_at: Date.now(),
        updated_at: Date.now(),
      });

      // Liberar mesa
      if (order.table_id) {
        await ctx.db.patch(order.table_id, {
          status: "free",
          current_order_id: undefined,
        });
        await removeOrderFromEnvironment(ctx, order.table_id, args.orderId);
      }

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

      return { success: true, newOrderId: null };
    }

    // Mark cancelled items
    for (const item of itemsToCancel) {
      await ctx.db.patch(item._id, {
        item_status: "cancelled",
      });
    }

    // Create new order with remaining items
    const newOrderNumber = `${order.order_number}-R`;
    const newOrderId = await ctx.db.insert("orders", {
      establishment_id: order.establishment_id,
      table_id: order.table_id,
      staff_id: order.staff_id,
      order_number: newOrderNumber,
      status: "open",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      payment_type: order.payment_type,
      source: order.source,
      guests: order.guests,
      notes: order.notes,
      is_commission_order: order.is_commission_order,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Move remaining items to new order
    for (const item of itemsToKeep) {
      await ctx.db.patch(item._id, {
        order_id: newOrderId,
      });
    }

    // Recalculate totals for both orders
    await ctx.scheduler.runAfter(0, internal.orders.recalculateOrderTotals, {
      orderId: args.orderId,
    });
    await ctx.scheduler.runAfter(0, internal.orders.recalculateOrderTotals, {
      orderId: newOrderId,
    });

    // Transfer table to new order
    if (order.table_id) {
      await ctx.db.patch(order.table_id, {
        current_order_id: newOrderId,
      });
      await ctx.db.patch(newOrderId, {
        table_id: order.table_id,
      });
    }

    // Close original order
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      closed_at: Date.now(),
      updated_at: Date.now(),
    });

    // Audit logs
    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "operational",
      level: "warning",
      actor: order.staff_id,
      action: "ORDER_PARTIAL_CANCEL",
      entity_type: "orders",
      entity_id: args.orderId,
      after: {
        newOrderId,
        itemsCancelled: itemsToCancel.length,
        itemsKept: itemsToKeep.length,
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    await ctx.db.insert("event_log", {
      establishment_id: order.establishment_id,
      type: "operational",
      level: "info",
      actor: order.staff_id,
      action: "ORDER_CREATED_FROM_PARTIAL",
      entity_type: "orders",
      entity_id: newOrderId,
      after: {
        originalOrderId: args.orderId,
        itemsTransferred: itemsToKeep.length,
      },
      timestamp: Date.now(),
    });

    return { success: true, newOrderId };
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
