import { query, mutation } from "./_generated/server";
import { v, type GenericId } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryCtx = any;

// --- HELPERS ---

const roundMoney = (value: number) => Math.round(value * 100) / 100;

/**
 * Recalcula y actualiza el estado de una mesa basado en los items de su orden.
 * 
 * Reglas:
 * - OCUPADA (occupied): Si hay items en cocina (pending, preparing/preparing->SENT, ready)
 * - ESPERA_PAGO (waiting_payment): Si todos los items están entregados (served->DELIVERED) o pagados (paid),
 *                                   y hay al menos uno entregado sin pagar
 * - No cambia: Si la mesa está en estado terminal (free, paid, maintenance, reserved, linked)
 * 
 * @param ctx Contexto de Convex
 * @param tableId ID de la mesa a actualizar
 * @param orderId ID de la orden (opcional, se busca si no se proporciona)
 */
async function recalculateTableStatus(
  ctx: QueryCtx,
  tableId: Id<"tables">,
  orderId?: Id<"orders">
): Promise<void> {
  const table = await ctx.db.get(tableId) as Doc<"tables"> | null;
  if (!table) return;

  // No recalcular si la mesa está en estado terminal o no tiene orden
  if (['free', 'paid', 'maintenance', 'reserved', 'linked'].includes(table.status)) {
    return;
  }

  const targetOrderId = orderId || table.current_order_id;
  if (!targetOrderId) return;

  // Obtener todos los items de la orden
  const orderItems = await ctx.db
    .query("order_items")
    .withIndex("by_order", (q: { eq: (field: string, value: GenericId<"orders">) => unknown }) => q.eq("order_id", targetOrderId))
    .collect() as Doc<"order_items">[];

  // Items activos (no cancelados)
  const activeItems = orderItems.filter((item: Doc<"order_items">) => item.item_status !== "cancelled");
  if (activeItems.length === 0) return;

  // Estados de items
  const hasKitchenItems = activeItems.some((item: Doc<"order_items">) =>
    ["pending", "preparing", "ready"].includes(item.item_status)
  );
  const hasDeliveredItems = activeItems.some((item: Doc<"order_items">) => item.item_status === "served");
  const hasUnpaidItems = activeItems.some((item: Doc<"order_items">) => item.item_status !== "paid");

  // Determinar estado objetivo
  let targetStatus: "occupied" | "waiting_payment" = "occupied";

  if (!hasKitchenItems && hasDeliveredItems && hasUnpaidItems) {
    targetStatus = "waiting_payment";
  }

  // Solo actualizar si hay cambio
  if (table.status !== targetStatus) {
    await ctx.db.patch(tableId, {
      status: targetStatus,
    });
  }
}

// --- QUERIES ---

export const getFirstEstablishment = query({
  args: {},
  handler: async (ctx) => {
    const establishment = await ctx.db.query("establishments").first();
    return establishment?._id ?? null;
  },
});

export const getEstablishmentData = query({
  args: {},
  handler: async (ctx) => {
    const establishment = await ctx.db.query("establishments").first();
    return establishment ?? null;
  },
});

export const getFirstStaff = query({
  args: { establishmentId: v.optional(v.id("establishments")) },
  handler: async (ctx, args) => {
    if (!args.establishmentId) return null;
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId!))
      .first();
    return staff?._id ?? null;
  },
});

export const getOrderByReservationId = query({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reservation", (q) => q.eq("reservation_id", args.reservationId))
      .first();
    return order;
  },
});

export const getOrderItems = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();
    return items;
  },
});

export const listEnvironments = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_establishment_and_status", (q) =>
        q.eq("establishment_id", args.establishmentId).eq("status", "active")
      )
      .collect();

    return environments.sort((a, b) => a.order - b.order);
  },
});

export const listTables = query({
  args: { establishmentId: v.id("establishments"), environmentId: v.optional(v.id("environments")) },
  handler: async (ctx, args) => {
    let tablesWithEnv;
    
    if (args.environmentId) {
      const environment = await ctx.db.get(args.environmentId!);
      const tables = await ctx.db
        .query("tables")
        .withIndex("by_environment", (q) => q.eq("environment_id", args.environmentId!))
        .collect();
      tablesWithEnv = tables.map((table) => ({ ...table, environmentName: environment?.name }));
    } else {
      // Get all environments for this establishment
      const environments = await ctx.db
        .query("environments")
        .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
        .collect();
      
      // Get tables for all environments with environment name
      tablesWithEnv = [];
      for (const env of environments) {
        const envTables = await ctx.db
          .query("tables")
          .withIndex("by_environment", (q) => q.eq("environment_id", env._id))
          .collect();
        tablesWithEnv.push(...envTables.map((table) => ({ ...table, environmentName: env.name })));
      }
    }
    
    return tablesWithEnv;
  },
});

// --- QUERIES ---

export const listCategories = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    return categories.sort((a, b) => a.order - b.order);
  },
});

export const listProducts = query({
  args: { 
    establishmentId: v.id("establishments"),
    categoryId: v.optional(v.id("categories"))
  },
  handler: async (ctx, args) => {
    let products;
    
    if (args.categoryId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category_id", args.categoryId!))
        .filter((q) =>
          q.and(
            q.eq(q.field("active"), true),
            q.eq(q.field("establishment_id"), args.establishmentId)
          )
        )
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
    }
    
    return products.sort((a, b) => a.order - b.order);
  },
});

export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const listOrders = query({
  args: { 
    establishmentId: v.id("establishments"),
    status: v.optional(v.union(v.literal("open"), v.literal("paid"), v.literal("cancelled"), v.literal("refunded")))
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_establishment_status", (q) => 
          q.eq("establishment_id", args.establishmentId).eq("status", args.status!)
        )
        .collect();
    }
    
    return await ctx.db
      .query("orders")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const orderItems = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    return {
      ...order,
      items: orderItems,
      payments,
    };
  },
});

export const listPayments = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Build index query based on provided date filters
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_establishment_timestamp", (q) => {
        // In Convex, after using a range operator (gte, gt, lt, lte),
        // we cannot chain additional range conditions.
        // We prioritize startDate (gte) if both are provided.
        if (args.startDate !== undefined) {
          return q.eq("establishment_id", args.establishmentId)
            .gte("timestamp", args.startDate);
        }
        if (args.endDate !== undefined) {
          return q.eq("establishment_id", args.establishmentId)
            .lte("timestamp", args.endDate);
        }
        return q.eq("establishment_id", args.establishmentId);
      })
      .collect();

    // Apply remaining filter in memory if needed
    if (args.startDate !== undefined && args.endDate !== undefined) {
      return payments.filter((p) => p.timestamp <= args.endDate!);
    }

    return payments;
  },
});

export const getOrderPayments = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();
    
    return payments;
  },
});

// --- MUTATIONS ---

export const createOrder = mutation({
  args: {
    establishmentId: v.id("establishments"),
    tableId: v.optional(v.id("tables")),
    environmentId: v.optional(v.id("environments")),
    staffId: v.id("staff"),
    customerId: v.optional(v.id("customers")),
    orderNumber: v.string(),
    guests: v.number(),
    paymentType: v.union(v.literal("individual"), v.literal("shared"), v.literal("split")),
    orderType: v.union(v.literal("dine_in"), v.literal("takeaway"), v.literal("delivery"), v.literal("counter")),
    source: v.union(v.literal("pos"), v.literal("pda"), v.literal("carta"), v.literal("voice"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      establishment_id: args.establishmentId,
      table_id: args.tableId,
      environment_id: args.environmentId,
      staff_id: args.staffId,
      customer_id: args.customerId,
      order_number: args.orderNumber,
      status: "open",
      total_amount: 0,
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      payment_type: args.paymentType,
      payment_status: "pending",
      order_type: args.orderType,
      source: args.source,
      is_refund: false,
      is_commission_order: false,
      guests: args.guests,
      created_at: now,
      updated_at: now,
    });

    return orderId;
  },
});

export const addOrderItem = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    productName: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    variant: v.optional(v.string()),
    notes: v.optional(v.string()),
    course: v.union(v.literal("first"), v.literal("second"), v.literal("dessert"), v.literal("drink")),
    itemStatus: v.optional(v.union(v.literal("pending"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const itemStatus = args.itemStatus || "pending";
    const sentToKitchenAt = itemStatus !== "cancelled" ? Date.now() : undefined;
    const readyAt = itemStatus === "ready" ? Date.now() : undefined;

    const orderItemId = await ctx.db.insert("order_items", {
      order_id: args.orderId,
      product_id: args.productId,
      product_name: args.productName,
      quantity: args.quantity,
      unit_price: args.unitPrice,
      total_price: args.totalPrice,
      variant: args.variant,
      notes: args.notes,
      course: args.course,
      item_status: itemStatus,
      sent_to_kitchen_at: sentToKitchenAt,
      ready_at: readyAt,
    });

    // Update order totals
    const order = await ctx.db.get(args.orderId);
    if (order) {
      // Only add to subtotal if item is not cancelled
      if (itemStatus !== "cancelled") {
        const newSubtotal = roundMoney(order.subtotal + args.totalPrice);
        // TODO: Calculate tax based on product tax rate
        const newTaxAmount = order.tax_amount;
        const newTotalAmount = roundMoney(newSubtotal + newTaxAmount - order.discount_amount);

        await ctx.db.patch(args.orderId, {
          subtotal: newSubtotal,
          tax_amount: newTaxAmount,
          total_amount: newTotalAmount,
          updated_at: Date.now(),
        });
      }
    }

    return orderItemId;
  },
});

export const updateOrderItem = mutation({
  args: {
    orderItemId: v.id("order_items"),
    quantity: v.optional(v.number()),
    notes: v.optional(v.string()),
    itemStatus: v.optional(v.union(v.literal("pending"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");

    const updates: Partial<Doc<"order_items">> = {};
    if (args.quantity !== undefined) {
      updates.quantity = args.quantity;
      updates.total_price = roundMoney(args.quantity * orderItem.unit_price);
    }
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.itemStatus !== undefined) {
      updates.item_status = args.itemStatus;
      // Registramos el envío a cocina para cualquier estado activo si no estaba ya registrado
      if (args.itemStatus !== "cancelled" && !orderItem.sent_to_kitchen_at) {
        updates.sent_to_kitchen_at = Date.now();
      }
      if (args.itemStatus === "ready" && !orderItem.ready_at) {
        updates.ready_at = Date.now();
      }
      // Limpiar ready_at cuando se revierte de ready a un estado anterior
      if ((args.itemStatus === "preparing" || args.itemStatus === "pending") && orderItem.ready_at) {
        updates.ready_at = undefined;
      }
    }

    await ctx.db.patch(args.orderItemId, updates);

    // Recalculate order totals if quantity changed or item status changed
    if (args.quantity !== undefined || args.itemStatus !== undefined) {
      const order = await ctx.db.get(orderItem.order_id);
      if (order) {
        const allItems = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("order_id", orderItem.order_id))
          .collect();
        
        // Only include non-cancelled items in subtotal
        const newSubtotal = roundMoney(allItems
          .filter(item => item.item_status !== "cancelled")
          .reduce((sum, item) => sum + item.total_price, 0));
        const newTotalAmount = roundMoney(newSubtotal + order.tax_amount - order.discount_amount);

        await ctx.db.patch(orderItem.order_id, {
          subtotal: newSubtotal,
          total_amount: newTotalAmount,
          updated_at: Date.now(),
        });
      }
    }

    // Recalculate table status based on order items (single source of truth in Convex)
    const order = await ctx.db.get(orderItem.order_id);
    if (order && order.table_id) {
      await recalculateTableStatus(ctx, order.table_id, order._id);
    }

    return args.orderItemId;
  },
});

export const deleteOrderItem = mutation({
  args: { orderItemId: v.id("order_items") },
  handler: async (ctx, args) => {
    const orderItem = await ctx.db.get(args.orderItemId);
    if (!orderItem) throw new Error("Order item not found");

    await ctx.db.delete(args.orderItemId);

    // Recalculate order totals
    const order = await ctx.db.get(orderItem.order_id);
    if (order) {
      const allItems = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("order_id", orderItem.order_id))
        .collect();
      
      // Only include non-cancelled items in subtotal
      const newSubtotal = roundMoney(allItems
        .filter(item => item.item_status !== "cancelled")
        .reduce((sum, item) => sum + item.total_price, 0));
      const newTotalAmount = roundMoney(newSubtotal + order.tax_amount - order.discount_amount);

      await ctx.db.patch(orderItem.order_id, {
        subtotal: newSubtotal,
        total_amount: newTotalAmount,
        updated_at: Date.now(),
      });
      
      // Recalculate table status based on order items (single source of truth in Convex)
      if (order.table_id) {
        await recalculateTableStatus(ctx, order.table_id, order._id);
      }
    }

    return orderItem.order_id;
  },
});

export const createPayment = mutation({
  args: {
    establishmentId: v.id("establishments"),
    orderId: v.id("orders"),
    orderItemIds: v.optional(v.array(v.id("order_items"))),
    method: v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"), v.literal("transfer"), v.literal("apple_pay"), v.literal("google_pay")),
    amount: v.number(),
    tip: v.number(),
    reference: v.optional(v.string()),
    staffId: v.id("staff"),
    paymentType: v.optional(v.union(v.literal("individual"), v.literal("shared"), v.literal("split"))),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      establishment_id: args.establishmentId,
      order_id: args.orderId,
      order_item_ids: args.orderItemIds,
      method: args.method,
      amount: args.amount,
      tip: args.tip,
      reference: args.reference,
      staff_id: args.staffId,
      timestamp: Date.now(),
    });

    // Check if order is fully paid
    const order = await ctx.db.get(args.orderId);
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (order) {
      // Usamos un pequeño margen de 0.005 para evitar problemas de precisión en coma flotante
      const isFullyPaid = totalPaid >= order.total_amount - 0.005;
      
      // Update payment_status based on payment amount
      let paymentStatus: "pending" | "partial" | "paid";
      if (isFullyPaid) {
        paymentStatus = "paid";
      } else if (totalPaid > 0) {
        paymentStatus = "partial";
      } else {
        paymentStatus = "pending";
      }

      const updates: Partial<Doc<"orders">> = {
        payment_status: paymentStatus,
        updated_at: Date.now(),
      };

      // Update payment_type if provided
      if (args.paymentType) {
        updates.payment_type = args.paymentType;
      }

      // Update order items status to "paid" if they were paid for
      if (args.orderItemIds && args.orderItemIds.length > 0) {
        for (const orderItemId of args.orderItemIds) {
          await ctx.db.patch(orderItemId, {
            item_status: "paid",
          });
        }
      } else if (totalPaid >= order.total_amount) {
        // If paying for the entire order and fully paid, mark all items as paid
        const allOrderItems = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
          .collect();
        
        for (const orderItem of allOrderItems) {
          await ctx.db.patch(orderItem._id, {
            item_status: "paid",
          });
        }
      }

      // If fully paid, also update order status and table status
      if (isFullyPaid) {
        updates.status = "paid";
        updates.closed_at = Date.now();

        // Update table status to "paid" if applicable
        if (order.table_id) {
          const table = await ctx.db.get(order.table_id);
          if (table) {
            await ctx.db.patch(order.table_id, {
              status: "paid",
            });
          }
        }

        // Mark reservation as completed if applicable
        if (order.reservation_id) {
          await ctx.db.patch(order.reservation_id, {
            status: "completed",
          });
        }
      }

      await ctx.db.patch(args.orderId, updates);

      // Recalculate table status for partial payments (not fully paid)
      // This handles the case where items are marked as paid but order isn't complete
      if (totalPaid < order.total_amount && order.table_id) {
        await recalculateTableStatus(ctx, order.table_id, order._id);
      }
    }

    // Return whether order is fully paid so frontend can update state reliably
    // This avoids a race condition where the frontend queries for order status
    // immediately after payment and may get stale data
    const isFullyPaid = order ? totalPaid >= order.total_amount - 0.005 : false;

    return { paymentId, isFullyPaid };
  },
});

export const closeOrder = mutation({
  args: {
    orderId: v.id("orders"),
    discountAmount: v.optional(v.number()),
    discountReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const updates: Partial<Doc<"orders">> = {
      status: "paid",
      closed_at: Date.now(),
      updated_at: Date.now(),
    };

    if (args.discountAmount !== undefined) {
      updates.discount_amount = args.discountAmount;
      updates.discount_reason = args.discountReason;
      updates.total_amount = order.subtotal + order.tax_amount - args.discountAmount;
    }

    await ctx.db.patch(args.orderId, updates);

    // Update table status if applicable
    if (order.table_id) {
      const table = await ctx.db.get(order.table_id);
      if (table) {
        const tableUpdate: Partial<Doc<"tables">> = {
          status: "free",
          current_order_id: undefined,
          guests_count: undefined,
          current_total: undefined,
          opened_at: undefined,
          first_sent_at: undefined,
        };
        await ctx.db.patch(order.table_id, tableUpdate);
      }
    }

    // Mark reservation as completed if applicable
    if (order.reservation_id) {
      await ctx.db.patch(order.reservation_id, {
        status: "completed",
      });
    }

    return order._id;
  },
});

export const updateTableWithOrder = mutation({
  args: {
    tableId: v.id("tables"),
    orderId: v.optional(v.id("orders")),
    guestsCount: v.optional(v.number()),
    currentTotal: v.optional(v.number()),
    status: v.optional(v.union(v.literal("free"), v.literal("occupied"), v.literal("reserved"), v.literal("maintenance"), v.literal("waiting_payment"), v.literal("paid"), v.literal("linked"))),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    const updates: Partial<Doc<"tables">> = {
      current_order_id: args.orderId,
    };

    if (args.guestsCount !== undefined) {
      updates.guests_count = args.guestsCount;
    }
    if (args.currentTotal !== undefined) {
      updates.current_total = args.currentTotal;
    }

    // If status is explicitly provided, use it
    if (args.status) {
      updates.status = args.status;
    } else {
      // If orderId is provided, set status to occupied, otherwise free
      if (args.orderId) {
        updates.status = "occupied";
        updates.opened_at = table.opened_at ?? Date.now();
      } else {
        updates.status = "free";
        updates.guests_count = 0;
        updates.current_total = undefined;
        updates.opened_at = undefined;
      }
    }

    await ctx.db.patch(args.tableId, updates);

    return table._id;
  },
});

export const updateOrderTable = mutation({
  args: {
    orderId: v.id("orders"),
    tableId: v.optional(v.id("tables")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, {
      table_id: args.tableId,
      updated_at: Date.now(),
    });

    return args.orderId;
  },
});

export const transferTableOrder = mutation({
  args: {
    sourceTableId: v.id("tables"),
    targetTableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const sourceTable = await ctx.db.get(args.sourceTableId);
    const targetTable = await ctx.db.get(args.targetTableId);
    if (!sourceTable || !targetTable) throw new Error("Table not found");

    const sourceOrderId = sourceTable.current_order_id;
    const sourceStatus = sourceTable.status;

    // Collect all descendants linked to source (direct + indirect).
    const allTables = await ctx.db.query("tables").collect();
    const linkedDescendantIds = new Set<string>();
    const queue: string[] = [args.sourceTableId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const directChildren = allTables.filter(
        (table) => table.merged_into_table_id === currentId
      );

      directChildren.forEach((child) => {
        const childId = child._id as string;
        if (!linkedDescendantIds.has(childId)) {
          linkedDescendantIds.add(childId);
          queue.push(childId);
        }
      });
    }

    // Source becomes maintenance and is detached.
    const sourceUpdate: Partial<Doc<"tables">> = {
      status: "maintenance",
      current_order_id: undefined,
      guests_count: undefined,
      current_total: undefined,
      opened_at: undefined,
      first_sent_at: undefined,
      merged_into_table_id: undefined,
    };
    await ctx.db.patch(args.sourceTableId, sourceUpdate);

    // Move source order to target table.
    if (sourceOrderId) {
      await ctx.db.patch(sourceOrderId, {
        table_id: args.targetTableId,
        updated_at: Date.now(),
      });
    }

    // Target inherits operational data from source.
    await ctx.db.patch(args.targetTableId, {
      status: sourceStatus === "maintenance" ? "occupied" : sourceStatus,
      current_order_id: sourceOrderId,
      guests_count: sourceTable.guests_count,
      current_total: sourceTable.current_total,
      opened_at: sourceTable.opened_at,
      first_sent_at: sourceTable.first_sent_at,
      merged_into_table_id: undefined,
    });

    // Repoint every linked descendant to the new root target.
    for (const linkedId of linkedDescendantIds) {
      await ctx.db.patch(linkedId as Id<"tables">, {
        status: "linked",
        merged_into_table_id: args.targetTableId,
      });
    }

    return args.targetTableId;
  },
});

export const updateTableStatus = mutation({
  args: {
    tableId: v.id("tables"),
    status: v.union(v.literal("free"), v.literal("occupied"), v.literal("reserved"), v.literal("maintenance"), v.literal("waiting_payment"), v.literal("paid"), v.literal("linked")),
    guestsCount: v.optional(v.number()),
    currentTotal: v.optional(v.number()),
    firstSentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    const updates: Partial<Doc<"tables">> = {
      status: args.status,
    };

    if (args.guestsCount !== undefined) updates.guests_count = args.guestsCount;
    if (args.currentTotal !== undefined) updates.current_total = args.currentTotal;
    if (args.firstSentAt !== undefined) updates.first_sent_at = args.firstSentAt;

    await ctx.db.patch(args.tableId, updates);

    return table._id;
  },
});

export const releaseTable = mutation({
  args: {
    tableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    // Find all tables that are linked to this table (direct + indirect)
    const allTables = await ctx.db.query("tables").collect();
    const linkedTableIds = new Set<string>();
    const queue: string[] = [args.tableId];

    while (queue.length > 0) {
      const currentRootId = queue.shift()!;
      const directChildren = allTables.filter(
        (candidate) => candidate.merged_into_table_id === currentRootId
      );

      directChildren.forEach((child) => {
        const childId = child._id as string;
        if (!linkedTableIds.has(childId)) {
          linkedTableIds.add(childId);
          queue.push(childId);
        }
      });
    }

    // Release the main table
    const mainReleaseUpdate: Partial<Doc<"tables">> = {
      status: "free",
      current_order_id: undefined,
      guests_count: undefined,
      current_total: undefined,
      opened_at: undefined,
      first_sent_at: undefined,
      merged_into_table_id: undefined,
    };
    await ctx.db.patch(args.tableId, mainReleaseUpdate);

    // If the table had an order with a reservation, mark the reservation as completed
    if (table.current_order_id) {
      const order = await ctx.db.get(table.current_order_id);
      if (order && order.reservation_id) {
        await ctx.db.patch(order.reservation_id, {
          status: "completed",
        });
      }
    }

    // Release all linked tables in the chain
    const linkedReleaseUpdate: Partial<Doc<"tables">> = {
      status: "free",
      current_order_id: undefined,
      guests_count: undefined,
      current_total: undefined,
      opened_at: undefined,
      first_sent_at: undefined,
      merged_into_table_id: undefined,
    };
    for (const linkedTableId of linkedTableIds) {
      await ctx.db.patch(linkedTableId as Id<"tables">, linkedReleaseUpdate);
    }

    return table._id;
  },
});

export const createRefund = mutation({
  args: {
    establishmentId: v.id("establishments"),
    orderId: v.id("orders"),
    orderItemIds: v.array(v.id("order_items")),
    reason: v.string(),
    amount: v.number(),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Generate unique refund order number
    const refundOrderNumber = `REF-${Date.now()}`;

    // Create a new refund order
    const refundOrderId = await ctx.db.insert("orders", {
      establishment_id: args.establishmentId,
      table_id: order.table_id,
      environment_id: order.environment_id,
      staff_id: args.staffId,
      customer_id: order.customer_id,
      order_number: refundOrderNumber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: "paid" as any,
      total_amount: -args.amount,
      subtotal: -args.amount,
      tax_amount: 0,
      discount_amount: 0,
      notes: `Refund: ${args.reason}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_type: "individual" as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_status: "paid" as any,
      order_type: order.order_type,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source: "pos" as any,
      is_refund: true,
      is_commission_order: false,
      guests: order.guests,
      created_at: Date.now(),
      updated_at: Date.now(),
      closed_at: Date.now(),
    });

    // Create order_items for the refund
    const refundedOrderItems = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    for (const orderItemId of args.orderItemIds) {
      const originalItem = refundedOrderItems.find((item) => item._id === orderItemId);
      if (originalItem) {
        await ctx.db.insert("order_items", {
          order_id: refundOrderId,
          product_id: originalItem.product_id,
          product_name: originalItem.product_name,
          quantity: originalItem.quantity,
          unit_price: -originalItem.unit_price,
          total_price: -originalItem.total_price,
          variant: originalItem.variant,
          notes: originalItem.notes,
          course: originalItem.course,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item_status: "cancelled" as any,
          sent_to_kitchen_at: undefined,
          ready_at: undefined,
        });
      }
    }

    // Create a refund payment record associated with the new refund order
    await ctx.db.insert("payments", {
      establishment_id: args.establishmentId,
      order_id: refundOrderId,
      order_item_ids: args.orderItemIds,
      method: "cash",
      amount: -args.amount,
      tip: 0,
      reference: `Refund: ${args.reason}`,
      staff_id: args.staffId,
      timestamp: Date.now(),
    });

    // Mark refunded items in original order as cancelled
    for (const orderItemId of args.orderItemIds) {
      await ctx.db.patch(orderItemId, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item_status: "cancelled" as any,
      });
    }

    // Recalculate original order totals excluding refunded items
    const allOrderItems = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const activeItems = allOrderItems.filter(
      (item) => !args.orderItemIds.includes(item._id) && item.item_status !== "cancelled"
    );

    const newSubtotal = activeItems.reduce((sum, item) => sum + item.total_price, 0);
    const newTotalAmount = newSubtotal + order.tax_amount - order.discount_amount;

    // Update original order
    await ctx.db.patch(args.orderId, {
      subtotal: newSubtotal,
      total_amount: newTotalAmount,
      updated_at: Date.now(),
    });

    // Update table status to maintenance if applicable
    if (order.table_id) {
      const table = await ctx.db.get(order.table_id);
      if (table) {
        await ctx.db.patch(order.table_id, {
          status: "maintenance",
        });
      }
    }

    return refundOrderId;
  },
});

export const mergeTables = mutation({
  args: {
    sourceTableId: v.id("tables"),
    targetTableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const sourceTable = await ctx.db.get(args.sourceTableId);
    const targetTable = await ctx.db.get(args.targetTableId);
    
    if (!sourceTable || !targetTable) throw new Error("Table not found");

    // Find the root table if target is already linked
    let actualTargetTable = targetTable;
    let actualTargetId = args.targetTableId;
    
    // Follow the chain to find the root table
    while (actualTargetTable.merged_into_table_id) {
      actualTargetId = actualTargetTable.merged_into_table_id;
      const nextTable = await ctx.db.get(actualTargetId);
      if (!nextTable) {
        break;
      }
      actualTargetTable = nextTable;
    }

    // If source is already linked, we need to move it to the new target
    if (sourceTable.merged_into_table_id) {
      // Source is already part of a merge - transfer its order to the new target if it has one
      const sourceOrder = sourceTable.current_order_id ? await ctx.db.get(sourceTable.current_order_id) : null;
      
      if (sourceOrder) {
        const sourceOrderItems = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("order_id", sourceOrder._id))
          .collect();

        const targetOrder = actualTargetTable.current_order_id ? await ctx.db.get(actualTargetTable.current_order_id) : null;

        if (targetOrder) {
          // Target has an order - merge items
          for (const item of sourceOrderItems) {
            await ctx.db.insert("order_items", {
              order_id: targetOrder._id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              variant: item.variant,
              notes: item.notes,
              course: item.course,
              item_status: item.item_status,
              sent_to_kitchen_at: item.sent_to_kitchen_at,
              ready_at: item.ready_at,
            });
          }

          // Recalculate target order totals
          const allTargetItems = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("order_id", targetOrder._id))
            .collect();
          
          const newSubtotal = allTargetItems
            .filter(item => item.item_status !== "cancelled")
            .reduce((sum, item) => sum + item.total_price, 0);
          const newTotalAmount = newSubtotal + targetOrder.tax_amount - targetOrder.discount_amount;

          await ctx.db.patch(targetOrder._id, {
            subtotal: newSubtotal,
            total_amount: newTotalAmount,
            updated_at: Date.now(),
          });

          // Delete source order
          await ctx.db.delete(sourceOrder._id);
        } else {
          // Target has no order - move the entire order to target
          await ctx.db.patch(sourceOrder._id, {
            table_id: actualTargetId,
            updated_at: Date.now(),
          });
        }
      }

      // Repoint source to new target
      const transferSourceUpdate: Partial<Doc<"tables">> = {
        merged_into_table_id: actualTargetId,
        current_order_id: undefined,
        guests_count: undefined,
        current_total: undefined,
        opened_at: undefined,
        first_sent_at: undefined,
      };
      await ctx.db.patch(args.sourceTableId, transferSourceUpdate);

      // Update target table with combined data
      const mergedGuests = (actualTargetTable.guests_count ?? 0) + (sourceTable.guests_count ?? 0);
      const mergedTotal = (actualTargetTable.current_total ?? 0) + (sourceTable.current_total ?? 0);
      const targetOrderId = actualTargetTable.current_order_id ?? sourceOrder?._id;

      await ctx.db.patch(actualTargetId, {
        status: targetOrderId ? "occupied" : "free",
        current_order_id: targetOrderId,
        guests_count: mergedGuests > 0 ? mergedGuests : undefined,
        current_total: mergedTotal > 0 ? mergedTotal : undefined,
      });

      return actualTargetId;
    }

    // Check if source is a root table (has tables linked to it)
    const allTables = await ctx.db.query("tables").collect();
    const tablesLinkedToSource = allTables.filter(t => t.merged_into_table_id === args.sourceTableId);

    // Get orders from both tables
    const sourceOrder = sourceTable.current_order_id ? await ctx.db.get(sourceTable.current_order_id) : null;
    const targetOrder = actualTargetTable.current_order_id ? await ctx.db.get(actualTargetTable.current_order_id) : null;

    // If source has an order, move its items to target order
    if (sourceOrder) {
      const sourceOrderItems = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("order_id", sourceOrder._id))
        .collect();

      if (targetOrder) {
        // Target has an order - merge items
        for (const item of sourceOrderItems) {
          await ctx.db.insert("order_items", {
            order_id: targetOrder._id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            variant: item.variant,
            notes: item.notes,
            course: item.course,
            item_status: item.item_status,
            sent_to_kitchen_at: item.sent_to_kitchen_at,
            ready_at: item.ready_at,
          });
        }

        // Recalculate target order totals
        const allTargetItems = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("order_id", targetOrder._id))
          .collect();
        
        const newSubtotal = allTargetItems
          .filter(item => item.item_status !== "cancelled")
          .reduce((sum, item) => sum + item.total_price, 0);
        const newTotalAmount = newSubtotal + targetOrder.tax_amount - targetOrder.discount_amount;

        await ctx.db.patch(targetOrder._id, {
          subtotal: newSubtotal,
          total_amount: newTotalAmount,
          updated_at: Date.now(),
        });

        // Delete source order
        await ctx.db.delete(sourceOrder._id);
      } else {
        // Target has no order - move the entire order to target
        await ctx.db.patch(sourceOrder._id, {
          table_id: actualTargetId,
          updated_at: Date.now(),
        });
      }
    }

    // Update source table status to linked and point to actual target (root)
    const linkSourceUpdate: Partial<Doc<"tables">> = {
      status: "linked",
      current_order_id: undefined,
      guests_count: undefined,
      current_total: undefined,
      opened_at: undefined,
      first_sent_at: undefined,
      merged_into_table_id: actualTargetId,
    };
    await ctx.db.patch(args.sourceTableId, linkSourceUpdate);

    // If source was a root table, repoint all its linked tables to the new root
    if (tablesLinkedToSource.length > 0) {
      for (const linkedTable of tablesLinkedToSource) {
        await ctx.db.patch(linkedTable._id, {
          merged_into_table_id: actualTargetId,
        });
      }
    }

    // Update target table with combined data
    const mergedGuests = (actualTargetTable.guests_count ?? 0) + (sourceTable.guests_count ?? 0);
    const mergedTotal = (actualTargetTable.current_total ?? 0) + (sourceTable.current_total ?? 0);
    const targetOrderId = targetOrder?._id ?? sourceOrder?._id ?? actualTargetTable.current_order_id;

    await ctx.db.patch(actualTargetId, {
      status: targetOrderId ? "occupied" : "free",
      current_order_id: targetOrderId,
      guests_count: mergedGuests > 0 ? mergedGuests : undefined,
      current_total: mergedTotal > 0 ? mergedTotal : undefined,
      merged_into_table_id: undefined,
    });

    return actualTargetId;
  },
});

// --- RESERVATIONS ---

export const listReservations = query({
  args: {
    establishmentId: v.id("establishments"),
    date: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("no_show"))),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("reservations")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId));

    const reservations = await query.collect();

    if (args.date) {
      return reservations.filter((r) => r.date === args.date);
    }

    if (args.status) {
      return reservations.filter((r) => r.status === args.status);
    }

    return reservations;
  },
});

export const searchCustomers = query({
  args: {
    establishmentId: v.id("establishments"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_establishment", (q) => q.eq("establishments_id", [args.establishmentId]))
      .collect();

    const searchLower = args.query.toLowerCase();

    return customers
      .filter((customer) => {
        const nameMatch = customer.name.toLowerCase().includes(searchLower);
        const phoneMatch = customer.phone?.toLowerCase().includes(searchLower.replace(/\s/g, ''));
        return nameMatch || phoneMatch;
      })
      .slice(0, 10); // Limit to 10 results
  },
});

export const getReservation = query({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reservationId);
  },
});

export const createReservation = mutation({
  args: {
    establishmentId: v.id("establishments"),
    tableId: v.optional(v.id("tables")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
    source: v.union(v.literal("dashboard"), v.literal("whatsapp"), v.literal("web"), v.literal("pos")),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    // If no customerId is provided, create a new customer
    let customerId = args.customerId;
    if (!customerId) {
      customerId = await ctx.db.insert("customers", {
        establishments_id: [args.establishmentId],
        name: args.customerName,
        phone: args.customerPhone,
        email: args.customerEmail,
        points: 0,
        tags: [],
        total_visits: 0,
        total_spent: 0,
        average_ticket: 0,
        allergens: [],
        created_at: Date.now(),
        source: "reservation",
      });
    }

    const reservationId = await ctx.db.insert("reservations", {
      establishment_id: args.establishmentId,
      table_id: args.tableId,
      customer_id: customerId,
      customer_name: args.customerName,
      customer_phone: args.customerPhone,
      customer_email: args.customerEmail,
      date: args.date,
      start_time: args.startTime,
      guests: args.guests,
      notes: args.notes,
      status: "confirmed",
      source: args.source,
      notified: false,
      reminder_sent: false,
      created_at: Date.now(),
    });

    // Create an order for this reservation
    const now = Date.now();
    // Map reservation source to order source
    const orderSource = args.source === "pos" ? "pos" : "agent";
    const orderId = await ctx.db.insert("orders", {
      establishment_id: args.establishmentId,
      table_id: args.tableId,
      environment_id: undefined,
      staff_id: args.staffId,
      customer_id: customerId,
      order_number: `RES-${Date.now()}`,
      status: "open",
      total_amount: 0,
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      payment_type: "individual",
      payment_status: "pending",
      order_type: "dine_in",
      source: orderSource,
      is_refund: false,
      is_commission_order: false,
      guests: args.guests,
      created_at: now,
      updated_at: now,
      reservation_id: reservationId,
    });

    // Don't change table status here - the frontend will show it as RESERVADA based on time

    return { reservationId, orderId };
  },
});

export const createCustomer = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customerId = await ctx.db.insert("customers", {
      establishments_id: [args.establishmentId],
      name: args.name,
      phone: args.phone,
      email: args.email,
      points: 0,
      tags: [],
      total_visits: 0,
      total_spent: 0,
      average_ticket: 0,
      allergens: [],
      created_at: Date.now(),
      source: "reservation",
    });
    return customerId;
  },
});

export const updateReservation = mutation({
  args: {
    reservationId: v.id("reservations"),
    tableId: v.optional(v.id("tables")),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    guests: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("no_show"))),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const updates: Partial<Doc<"reservations">> = {};

    if (args.customerName !== undefined) updates.customer_name = args.customerName;
    if (args.customerPhone !== undefined) updates.customer_phone = args.customerPhone;
    if (args.customerEmail !== undefined) updates.customer_email = args.customerEmail;
    if (args.date !== undefined) updates.date = args.date;
    if (args.startTime !== undefined) updates.start_time = args.startTime;
    if (args.guests !== undefined) updates.guests = args.guests;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) updates.status = args.status;

    // Handle table change
    if (args.tableId !== undefined && args.tableId !== reservation.table_id) {
      updates.table_id = args.tableId;
    }

    await ctx.db.patch(args.reservationId, updates);

    return args.reservationId;
  },
});

export const cancelReservation = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // Update reservation status to cancelled
    await ctx.db.patch(args.reservationId, {
      status: "cancelled",
    });

    return args.reservationId;
  },
});
