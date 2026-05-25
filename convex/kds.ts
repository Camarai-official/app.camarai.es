import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listKitchenStations = query({
  args: { establishmentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kitchen_stations")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId as any))
      .collect();
  },
});

export const createKitchenStation = mutation({
  args: {
    establishmentId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    display_order: v.number(),
    preparation_types: v.array(v.string()),
    average_preparation_time: v.optional(v.number()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { establishmentId, ...data } = args;
    return await ctx.db.insert("kitchen_stations", {
      ...data,
      establishment_id: establishmentId as any,
      created_at: Date.now(),
    });
  },
});

export const updateKitchenStation = mutation({
  args: {
    stationId: v.id("kitchen_stations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    display_order: v.optional(v.number()),
    preparation_types: v.optional(v.array(v.string())),
    average_preparation_time: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { stationId, ...updates } = args;
    await ctx.db.patch(stationId, updates);
  },
});

export const deleteKitchenStation = mutation({
  args: { stationId: v.id("kitchen_stations") },
  handler: async (ctx, args) => {
    // Delete associated routing rules first
    const rules = await ctx.db
      .query("kds_routing_rules")
      .withIndex("by_station", (q) => q.eq("station_id", args.stationId))
      .collect();
      
    for (const rule of rules) {
      await ctx.db.delete(rule._id);
    }
    
    await ctx.db.delete(args.stationId);
  },
});

export const listRoutingRules = query({
  args: { establishmentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kds_routing_rules")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId as any))
      .collect();
  },
});

export const createRoutingRule = mutation({
  args: {
    establishmentId: v.string(),
    stationId: v.id("kitchen_stations"),
    ruleType: v.union(v.literal("category"), v.literal("product"), v.literal("keyword")),
    categoryId: v.optional(v.id("categories")),
    productId: v.optional(v.id("products")),
    keywords: v.optional(v.array(v.string())),
    priority: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("kds_routing_rules", {
      establishment_id: args.establishmentId as any,
      station_id: args.stationId,
      rule_type: args.ruleType,
      category_id: args.categoryId,
      product_id: args.productId,
      keywords: args.keywords,
      priority: args.priority,
      active: args.active,
      created_at: Date.now(),
    });
  },
});

export const deleteRoutingRule = mutation({
  args: { ruleId: v.id("kds_routing_rules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.ruleId);
  },
});
