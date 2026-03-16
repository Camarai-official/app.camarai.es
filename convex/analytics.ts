import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Alertas de Stock (Equivalente a view_stock_alerts de SQL)
 */
export const getStockAlerts = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("ingredients")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    return alerts
      .filter((i) => i.stock <= i.alert_min)
      .map((i) => ({
        name: i.name,
        stock: i.stock,
        alert_min: i.alert_min,
        urgency: i.stock <= 0 ? "OUT OF STOCK" : i.stock <= i.alert_min * 0.5 ? "CRITICAL" : "LOW STOCK",
      }));
  },
});

/**
 * Platos Estrella y Margen (Equivalente a view_star_products_performance)
 */
export const getProductPerformance = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .filter((q) => q.eq(q.field("status"), "paid"))
      .collect();

    // Lógica de agregación para emular el GROUP BY de SQL
    const performance = products.map((p) => {
      return {
        name: p.name,
        cost: p.cost,
        price: p.price,
        profit_per_unit: p.price - p.cost,
        margin_percent: Math.round(((p.price - p.cost) / p.price) * 100),
      };
    });

    return performance.sort((a, b) => b.profit_per_unit - a.profit_per_unit);
  },
});

/**
 * Resumen Diario del Dashboard (Equivalente a view_daily_dashboard_summary)
 */
export const getDailySummary = query({
  args: { 
    establishmentId: v.id("establishments"),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const lookbackDays = args.days || 7;
    const threshold = Date.now() - (lookbackDays * 24 * 60 * 60 * 1000);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_establishment_created", (q) => 
        q.eq("establishment_id", args.establishmentId).gte("created_at", threshold)
      )
      .collect();

    const paidOrders = orders.filter((o) => o.status === "paid");
    
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
    const totalOrders = paidOrders.length;

    return {
      revenue: totalRevenue,
      order_count: totalOrders,
      average_ticket: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  },
});
