import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCompanyById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCompanyByEstablishment = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const establishment = await ctx.db.get(args.establishmentId);
    if (!establishment) return null;
    return await ctx.db.get(establishment.company_id);
  },
});

export const updateCompany = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    legal_name: v.optional(v.string()),
    nif: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    country: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
    return id;
  },
});
