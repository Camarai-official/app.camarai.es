import { v } from "convex/values";
import { query } from "./_generated/server";

export const getEstablishments = query({
  args: {},
  handler: async (ctx) => {
    const establishments = await ctx.db.query("establishments").collect();
    return establishments;
  },
});

export const getEstablishmentById = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const establishment = await ctx.db.get(args.establishmentId);
    return establishment;
  },
});

export const getEstablishmentsByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const establishments = await ctx.db
      .query("establishments")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();
    return establishments;
  },
});
