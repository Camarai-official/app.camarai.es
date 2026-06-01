import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

export const createCheckoutSession = action({
  args: {
    orderId: v.id("orders"),
    totalAmount: v.number(), // El total en euros
    orderNumber: v.string(),
    orderItemIds: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    // Inicializamos Stripe con la variable de entorno de Convex
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia"
    });

    try {
      const sessionMetadata: Record<string, string> = {
        orderId: args.orderId,
      };

      if (args.orderItemIds && args.orderItemIds.length > 0) {
        sessionMetadata.orderItemIds = JSON.stringify(args.orderItemIds);
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "link"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Pedido #${args.orderNumber}`,
                description: "Ticket de restaurante",
              },
              // Stripe espera el importe en céntimos
              unit_amount: Math.round(args.totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.HOST_URL || "http://localhost:5173"}/?checkout=success&order_id=${args.orderId}`,
        cancel_url: `${process.env.HOST_URL || "http://localhost:5173"}/?payment=cancel`,
        metadata: sessionMetadata,
      });

      // Devolvemos la URL de Stripe al frontend
      return { url: session.url };
    } catch (error) {
      console.error(error);
      throw new Error("No se pudo crear la sesión de Stripe");
    }
  },
});

export const fulfillStripePayment = internalMutation({
  args: {
    orderId: v.id("orders"),
    orderItemIds: v.optional(v.array(v.id("order_items"))),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const amountPaid = args.amount !== undefined ? args.amount : order.total_amount;

    // 1. Insert payment record
    const paymentId = await ctx.db.insert("payments", {
      establishment_id: order.establishment_id,
      order_id: args.orderId,
      order_item_ids: args.orderItemIds,
      method: "card",
      amount: amountPaid,
      tip: 0,
      staff_id: order.staff_id,
      timestamp: Date.now(),
    });

    // Calculate total paid including this new payment
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const isFullyPaid = totalPaid >= order.total_amount - 0.005;

    // 2. Update order items to paid
    if (args.orderItemIds && args.orderItemIds.length > 0) {
      for (const itemId of args.orderItemIds) {
        await ctx.db.patch(itemId, { item_status: "paid" });
      }
    } else if (isFullyPaid) {
      const orderItems = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
        .collect();

      const allItemIds = [];
      for (const item of orderItems) {
        if (item.item_status !== "cancelled") {
          allItemIds.push(item._id);
          await ctx.db.patch(item._id, { item_status: "paid" });
        }
      }

      // Update the payment record to include ALL item IDs
      await ctx.db.patch(paymentId, {
        order_item_ids: allItemIds,
      });
    }

    // 3. Update order
    if (isFullyPaid) {
      await ctx.db.patch(args.orderId, {
        status: "paid",
        payment_status: "paid",
        payment_type: "individual",
        closed_at: Date.now(),
        updated_at: Date.now(),
      });

      // 4. Update table status to "paid" if occupied
      if (order.table_id) {
        const table = await ctx.db.get(order.table_id);
        if (table) {
          await ctx.db.patch(order.table_id, {
            status: "paid",
          });
        }
      }

      // 5. Update reservation if any
      if (order.reservation_id) {
        await ctx.db.patch(order.reservation_id, {
          status: "completed",
        });
      }
    } else {
      await ctx.db.patch(args.orderId, {
        payment_status: "partial",
        updated_at: Date.now(),
      });
    }

    return true;
  },
});
