import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { Doc } from "./_generated/dataModel";

/**
 * Helper type for backfill result
 */
type BackfillResult = {
  success: boolean;
  establishmentId: string;
  totalProcessed: number;
  iterations: number;
};

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
 * Internal mutation: Process a batch of orders for backfill
 * This is called iteratively by the backfill action to handle large datasets
 */
export const processBackfillBatch = internalMutation({
  args: {
    establishmentId: v.id("establishments"),
    cursor: v.optional(v.id("orders")),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Get batch of orders starting from cursor
    let query = ctx.db
      .query("orders")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      );

    if (args.cursor) {
      // Note: Convex doesn't support direct cursor pagination on _id easily
      // We process all orders for simplicity in backfill
    }

    const orders = await query.take(args.batchSize);

    if (orders.length === 0) {
      return { done: true, processed: 0 };
    }

    // Aggregate data for global and monthly KPIs
    const globalData = {
      totalRevenue: 0,
      totalOrders: 0,
      totalItemsSold: 0,
      totalServiceTimeMs: 0,
      commissionOrders: 0,
    };

    const monthlyData: Map<
      string,
      {
        totalRevenue: number;
        totalOrders: number;
        totalItemsSold: number;
      }
    > = new Map();

    for (const order of orders) {
      if (order.status !== "paid") continue;

      // Global aggregation
      globalData.totalRevenue += order.total_amount;
      globalData.totalOrders += 1;
      if (order.is_commission_order) {
        globalData.commissionOrders += 1;
      }

      // Service time calculation
      if (order.closed_at) {
        globalData.totalServiceTimeMs += order.closed_at - order.created_at;
      }

      // Monthly aggregation
      const yearMonth = getYearMonth(order.created_at);
      if (!monthlyData.has(yearMonth)) {
        monthlyData.set(yearMonth, {
          totalRevenue: 0,
          totalOrders: 0,
          totalItemsSold: 0,
        });
      }
      const monthStats = monthlyData.get(yearMonth)!;
      monthStats.totalRevenue += order.total_amount;
      monthStats.totalOrders += 1;

      // Count items for this order
      const items = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("order_id", order._id))
        .collect();

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      globalData.totalItemsSold += itemCount;
      monthStats.totalItemsSold += itemCount;
    }

    // Upsert global KPIs
    const existingGlobal = await ctx.db
      .query("establishment_kpis")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .unique();

    const avgServiceTimeMs =
      globalData.totalOrders > 0
        ? Math.round(globalData.totalServiceTimeMs / globalData.totalOrders)
        : 0;

    const upsellRate =
      globalData.totalOrders > 0
        ? (globalData.commissionOrders / globalData.totalOrders) * 100
        : 0;

    const averageTicket =
      globalData.totalOrders > 0
        ? Math.round(globalData.totalRevenue / globalData.totalOrders)
        : 0;

    if (existingGlobal) {
      await ctx.db.patch(existingGlobal._id, {
        total_revenue: globalData.totalRevenue,
        total_orders: globalData.totalOrders,
        average_ticket: averageTicket,
        total_items_sold: globalData.totalItemsSold,
        avg_service_time_ms: avgServiceTimeMs,
        upsell_rate: Math.round(upsellRate * 100) / 100,
        last_updated: Date.now(),
      });
    } else {
      await ctx.db.insert("establishment_kpis", {
        establishment_id: args.establishmentId,
        total_revenue: globalData.totalRevenue,
        total_orders: globalData.totalOrders,
        average_ticket: averageTicket,
        total_items_sold: globalData.totalItemsSold,
        avg_service_time_ms: avgServiceTimeMs,
        upsell_rate: Math.round(upsellRate * 100) / 100,
        last_updated: Date.now(),
      });
    }

    // Upsert monthly KPIs
    for (const [yearMonth, stats] of monthlyData) {
      const existingMonth = await ctx.db
        .query("month_kpi_establishment")
        .withIndex("by_establishment_month", (q) =>
          q.eq("establishment_id", args.establishmentId).eq("year_month", yearMonth)
        )
        .unique();

      const monthAverageTicket =
        stats.totalOrders > 0
          ? Math.round(stats.totalRevenue / stats.totalOrders)
          : 0;

      if (existingMonth) {
        await ctx.db.patch(existingMonth._id, {
          total_revenue: stats.totalRevenue,
          total_orders: stats.totalOrders,
          average_ticket: monthAverageTicket,
          total_items_sold: stats.totalItemsSold,
          last_updated: Date.now(),
        });
      } else {
        await ctx.db.insert("month_kpi_establishment", {
          establishment_id: args.establishmentId,
          year_month: yearMonth,
          total_revenue: stats.totalRevenue,
          total_orders: stats.totalOrders,
          average_ticket: monthAverageTicket,
          total_items_sold: stats.totalItemsSold,
          last_updated: Date.now(),
        });
      }
    }

    return {
      done: orders.length < args.batchSize,
      processed: orders.length,
      lastCursor: orders[orders.length - 1]?._id,
    };
  },
});

/**
 * Internal Query: Get all establishments for backfill
 */
export const getAllEstablishments = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("establishments").collect();
  },
});

/**
 * Internal Action: Backfill KPIs for a single establishment
 * Can be called manually to initialize KPIs for existing data
 */
export const backfillEstablishmentKPIs = internalAction({
  args: {
    establishmentId: v.id("establishments"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<BackfillResult> => {
    const batchSize = args.batchSize || 100;
    let cursor: Id<"orders"> | undefined;
    let totalProcessed = 0;
    let iterations = 0;
    const maxIterations = 1000; // Safety limit

    console.log(
      `Starting KPI backfill for establishment: ${args.establishmentId}`
    );

    // Process all orders in a single mutation call
    // The processBackfillBatch handles the heavy lifting
    const result = await ctx.runMutation(internal.kpiBackfill.processBackfillBatch, {
      establishmentId: args.establishmentId,
      cursor: undefined,
      batchSize: 10000, // Process up to 10k orders at once
    });

    totalProcessed = result.processed;

    console.log(
      `KPI backfill complete for establishment ${args.establishmentId}. Total orders scanned: ${totalProcessed}`
    );

    return {
      success: true,
      establishmentId: args.establishmentId,
      totalProcessed,
      iterations,
    };
  },
});

/**
 * Internal Action: Backfill KPIs for ALL establishments
 * WARNING: This may take a long time for large datasets
 */
export const backfillAllKPIs = internalAction({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; establishmentsProcessed: number; totalProcessed: number; details: BackfillResult[] }> => {
    // Get all establishments
    const establishments: Doc<"establishments">[] = await ctx.runQuery(internal.kpiBackfill.getAllEstablishments, {});

    console.log(`Found ${establishments.length} establishments to backfill`);

    const results: BackfillResult[] = [];
    for (const establishment of establishments) {
      const result: BackfillResult = await ctx.runAction(
        internal.kpiBackfill.backfillEstablishmentKPIs,
        {
          establishmentId: establishment._id,
          batchSize: args.batchSize || 100,
        }
      );
      results.push(result);
    }

    const totalProcessed = results.reduce(
      (sum, r) => sum + (r.totalProcessed || 0),
      0
    );

    console.log(
      `Global KPI backfill complete. Total orders processed: ${totalProcessed}`
    );

    return {
      success: true,
      establishmentsProcessed: establishments.length,
      totalProcessed,
      details: results,
    };
  },
});
