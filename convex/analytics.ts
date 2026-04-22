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
 * NOTA: Esta función analiza catálogo, no órdenes - sigue usando products table
 */
export const getProductPerformance = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
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
 * Resumen Global del Dashboard (HyperFast - O(1) desde KPIs pre-agregados)
 * Lee directamente de establishment_kpis, NO escanea tabla de órdenes
 */
export const getDashboardKPIs = query({
  args: {
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const kpis = await ctx.db
      .query("establishment_kpis")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .unique();

    if (!kpis) {
      return {
        total_revenue: 0,
        total_orders: 0,
        average_ticket: 0,
        total_items_sold: 0,
        avg_service_time_ms: 0,
        avg_service_time_minutes: 0,
        upsell_rate: 0,
        last_updated: null,
      };
    }

    return {
      total_revenue: kpis.total_revenue,
      total_orders: kpis.total_orders,
      average_ticket: kpis.average_ticket,
      total_items_sold: kpis.total_items_sold,
      avg_service_time_ms: kpis.avg_service_time_ms,
      avg_service_time_minutes: Math.round(kpis.avg_service_time_ms / 60000),
      upsell_rate: kpis.upsell_rate,
      last_updated: kpis.last_updated,
    };
  },
});

/**
 * Resumen Mensual del Dashboard (HyperFast - O(1) desde KPIs pre-agregados)
 */
export const getMonthlyKPIs = query({
  args: {
    establishmentId: v.id("establishments"),
    yearMonth: v.string(), // Format "YYYY-MM"
  },
  handler: async (ctx, args) => {
    const kpis = await ctx.db
      .query("month_kpi_establishment")
      .withIndex("by_establishment_month", (q) =>
        q.eq("establishment_id", args.establishmentId).eq("year_month", args.yearMonth)
      )
      .unique();

    if (!kpis) {
      return {
        year_month: args.yearMonth,
        total_revenue: 0,
        total_orders: 0,
        average_ticket: 0,
        total_items_sold: 0,
        last_updated: null,
      };
    }

    return {
      year_month: kpis.year_month,
      total_revenue: kpis.total_revenue,
      total_orders: kpis.total_orders,
      average_ticket: kpis.average_ticket,
      total_items_sold: kpis.total_items_sold,
      last_updated: kpis.last_updated,
    };
  },
});

/**
 * DEPRECATED: Resumen Diario antiguo (escanea órdenes - lento)
 * Usar getDashboardKPIs o getMonthlyKPIs para lecturas HyperFast
 */
export const getDailySummary = query({
  args: {
    establishmentId: v.id("establishments"),
    days: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Fallback: leer de KPIs globales en lugar de escanear órdenes
    const kpis = await ctx.db
      .query("establishment_kpis")
      .withIndex("by_establishment", (q) =>
        q.eq("establishment_id", args.establishmentId)
      )
      .unique();

    if (!kpis) {
      return {
        revenue: 0,
        order_count: 0,
        average_ticket: 0,
      };
    }

    return {
      revenue: kpis.total_revenue,
      order_count: kpis.total_orders,
      average_ticket: kpis.average_ticket,
    };
  },
});

/**
 * Get sales data by period for charts
 * Groups orders by day, hour, or month based on view mode
 */
export const getSalesByPeriod = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
    viewMode: v.union(v.literal("hours"), v.literal("days"), v.literal("months")),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_establishment_created", (q) =>
        q
          .eq("establishment_id", args.establishmentId)
          .gte("created_at", args.startDate)
          .lte("created_at", args.endDate)
      )
      .collect();

    const paidOrders = orders.filter((o) => o.status === "paid");

    const groupedData = new Map<string, number>();

    for (const order of paidOrders) {
      const date = new Date(order.created_at);
      let key: string;

      if (args.viewMode === "hours") {
        // Group by hour (HH:00)
        key = `${String(date.getHours()).padStart(2, "0")}:00`;
      } else if (args.viewMode === "days") {
        // Group by day (dd MMM)
        key = `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        // Group by month (MMM)
        const months = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];
        key = months[date.getMonth()];
      }

      groupedData.set(key, (groupedData.get(key) || 0) + order.total_amount);
    }

    // Convert to array and sort by date
    const result = Array.from(groupedData.entries()).map(([label, value]) => ({
      label,
      value: value / 100, // Convert cents to euros
    }));

    return result;
  },
});

/**
 * Desglose de Costes
 * Agrega costes por categoría basado en stock_movements
 */
export const getCostBreakdown = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    const movements = await ctx.db
      .query("stock_movements")
      .withIndex("by_establishment_timestamp", (q) =>
        q
          .eq("establishment_id", args.establishmentId)
          .gte("timestamp", args.startDate)
          .lte("timestamp", args.endDate)
      )
      .collect();

    // Agrupar costes por tipo
    const costByType = new Map<string, number>();
    
    for (const movement of movements) {
      const current = costByType.get(movement.type) || 0;
      costByType.set(movement.type, current + movement.total_cost);
    }

    // Mapear tipos a categorías legibles
    const breakdown = [
      {
        name: 'Ingredientes',
        value: (costByType.get("purchase") || 0) / 100, // Convert cents to euros
        color: "bg-chart-1"
      },
      {
        name: 'Mermas',
        value: (costByType.get("waste") || 0) / 100,
        color: "bg-chart-4"
      },
      {
        name: 'Ajustes',
        value: (costByType.get("adjustment") || 0) / 100,
        color: "bg-chart-5"
      },
    ];

    return breakdown.filter(item => item.value > 0);
  },
});

/**
 * Ranking de Equipo por Ventas
 * Agrega ventas por staff member
 */
export const getStaffSalesRanking = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_establishment_status", (q) =>
        q.eq("establishment_id", args.establishmentId).eq("status", "paid")
      )
      .collect();

    // Filter by date range
    const filteredOrders = paidOrders.filter(
      (order) =>
        order.created_at >= args.startDate && order.created_at <= args.endDate
    );

    // Aggregate by staff_id
    const salesByStaff = new Map<
      string,
      { staffId: string; totalSales: number; orderCount: number }
    >();

    for (const order of filteredOrders) {
      const current = salesByStaff.get(order.staff_id) || {
        staffId: order.staff_id,
        totalSales: 0,
        orderCount: 0,
      };
      salesByStaff.set(order.staff_id, {
        staffId: order.staff_id,
        totalSales: current.totalSales + order.total_amount,
        orderCount: current.orderCount + 1,
      });
    }

    // Get staff details for each
    const ranking = await Promise.all(
      Array.from(salesByStaff.values()).map(async (staffSales) => {
        const staff = await ctx.db.get(staffSales.staffId as any) as any;
        return {
          id: staffSales.staffId,
          name: staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Unknown",
          avatar: staff?.photo_url || "",
          sales: staffSales.totalSales / 100, // Convert cents to euros
          orderCount: staffSales.orderCount,
        };
      })
    );

    // Sort by sales descending
    return ranking.sort((a, b) => b.sales - a.sales);
  },
});
