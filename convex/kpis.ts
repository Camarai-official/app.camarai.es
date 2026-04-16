import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Helper: Get year-month string in "YYYY-MM" format from timestamp
 */
function getYearMonth(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Helper: Get or create global KPI record for establishment
 */
async function getOrCreateGlobalKPIs(
  ctx: MutationCtx,
  establishmentId: Id<"establishments">
) {
  const existing = await ctx.db
    .query("establishment_kpis")
    .withIndex("by_establishment", (q) => q.eq("establishment_id", establishmentId))
    .unique();

  if (existing) {
    return existing;
  }

  const kpiId = await ctx.db.insert("establishment_kpis", {
    establishment_id: establishmentId,
    total_revenue: 0,
    total_orders: 0,
    average_ticket: 0,
    total_items_sold: 0,
    avg_service_time_ms: 0,
    upsell_rate: 0,
    last_updated: Date.now(),
  });

  return await ctx.db.get(kpiId);
}

/**
 * Helper: Get or create monthly KPI record for establishment
 */
async function getOrCreateMonthlyKPIs(
  ctx: MutationCtx,
  establishmentId: Id<"establishments">,
  yearMonth: string
) {
  const existing = await ctx.db
    .query("month_kpi_establishment")
    .withIndex("by_establishment_month", (q) =>
      q.eq("establishment_id", establishmentId).eq("year_month", yearMonth)
    )
    .unique();

  if (existing) {
    return existing;
  }

  const kpiId = await ctx.db.insert("month_kpi_establishment", {
    establishment_id: establishmentId,
    year_month: yearMonth,
    total_revenue: 0,
    total_orders: 0,
    average_ticket: 0,
    total_items_sold: 0,
    last_updated: Date.now(),
  });

  return await ctx.db.get(kpiId);
}

/**
 * Calculate new running average using incremental formula
 * new_avg = ((old_avg * n) + new_value) / (n + 1)
 */
function calculateRunningAverage(
  currentAvg: number,
  currentCount: number,
  newValue: number
): number {
  if (currentCount === 0) {
    return newValue;
  }
  return Math.round(
    (currentAvg * currentCount + newValue) / (currentCount + 1)
  );
}

/**
 * Update KPIs when an order is paid
 * CRITICAL: This uses incremental updates - NO .collect() or .count() on orders table
 */
export const updateKPIsOnOrderPaid = internalMutation({
  args: {
    establishmentId: v.id("establishments"),
    orderAmount: v.number(),
    orderCreatedAt: v.number(),
    orderClosedAt: v.optional(v.number()),
    isCommissionOrder: v.optional(v.boolean()),
    itemCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const yearMonth = getYearMonth(args.orderCreatedAt);

    // Get or create KPI records
    const globalKPIs = await getOrCreateGlobalKPIs(ctx, args.establishmentId);
    const monthlyKPIs = await getOrCreateMonthlyKPIs(
      ctx,
      args.establishmentId,
      yearMonth
    );

    if (!globalKPIs || !monthlyKPIs) {
      throw new Error("Failed to get or create KPI records");
    }

    // Calculate new totals incrementally
    const newTotalRevenue = globalKPIs.total_revenue + args.orderAmount;
    const newTotalOrders = globalKPIs.total_orders + 1;
    const newAverageTicket = Math.round(newTotalRevenue / newTotalOrders);

    // Calculate new monthly totals incrementally
    const newMonthlyRevenue = monthlyKPIs.total_revenue + args.orderAmount;
    const newMonthlyOrders = monthlyKPIs.total_orders + 1;
    const newMonthlyAverageTicket = Math.round(
      newMonthlyRevenue / newMonthlyOrders
    );

    // Update global KPIs
    await ctx.db.patch(globalKPIs._id, {
      total_revenue: newTotalRevenue,
      total_orders: newTotalOrders,
      average_ticket: newAverageTicket,
      last_updated: Date.now(),
    });

    // Update monthly KPIs
    await ctx.db.patch(monthlyKPIs._id, {
      total_revenue: newMonthlyRevenue,
      total_orders: newMonthlyOrders,
      average_ticket: newMonthlyAverageTicket,
      last_updated: Date.now(),
    });

    // Update upsell rate if it's a commission order (whatsapp/carta orders)
    if (args.isCommissionOrder) {
      // Count upsell orders as commission orders
      // This is a simplified calculation - could be refined
      const newUpsellCount =
        (globalKPIs.total_orders * globalKPIs.upsell_rate) / 100 +
        (args.isCommissionOrder ? 1 : 0);
      const newUpsellRate = (newUpsellCount / newTotalOrders) * 100;

      await ctx.db.patch(globalKPIs._id, {
        upsell_rate: Math.round(newUpsellRate * 100) / 100,
      });
    }

    // Update service time if order is closed
    if (args.orderClosedAt) {
      const serviceTimeMs = args.orderClosedAt - args.orderCreatedAt;
      const newAvgServiceTime = calculateRunningAverage(
        globalKPIs.avg_service_time_ms,
        globalKPIs.total_orders - 1, // Previous count before this order
        serviceTimeMs
      );

      await ctx.db.patch(globalKPIs._id, {
        avg_service_time_ms: newAvgServiceTime,
      });
    }

    // Update items sold count if provided
    if (args.itemCount && args.itemCount > 0) {
      const newItemsSold = globalKPIs.total_items_sold + args.itemCount;
      const newMonthlyItemsSold =
        monthlyKPIs.total_items_sold + args.itemCount;

      await ctx.db.patch(globalKPIs._id, {
        total_items_sold: newItemsSold,
      });

      await ctx.db.patch(monthlyKPIs._id, {
        total_items_sold: newMonthlyItemsSold,
      });
    }
  },
});

/**
 * Update KPIs when items are added to an order
 * Called from addOrderItem mutation
 */
export const updateKPIsOnItemsAdded = internalMutation({
  args: {
    establishmentId: v.id("establishments"),
    itemQuantity: v.number(),
    orderCreatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const yearMonth = getYearMonth(args.orderCreatedAt);

    // Get or create KPI records
    const globalKPIs = await getOrCreateGlobalKPIs(ctx, args.establishmentId);
    const monthlyKPIs = await getOrCreateMonthlyKPIs(
      ctx,
      args.establishmentId,
      yearMonth
    );

    if (!globalKPIs || !monthlyKPIs) {
      throw new Error("Failed to get or create KPI records");
    }

    // Incrementally update item counts
    const newItemsSold = globalKPIs.total_items_sold + args.itemQuantity;
    const newMonthlyItemsSold =
      monthlyKPIs.total_items_sold + args.itemQuantity;

    await ctx.db.patch(globalKPIs._id, {
      total_items_sold: newItemsSold,
      last_updated: Date.now(),
    });

    await ctx.db.patch(monthlyKPIs._id, {
      total_items_sold: newMonthlyItemsSold,
      last_updated: Date.now(),
    });
  },
});
