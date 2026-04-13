import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getEstablishmentByLocalId = query({
  args: {
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.establishmentId);
  },
});

export const createEstablishmentFromLocal = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("establishments", {
      company_id: args.companyId,
      name: args.name,
      cif: "PENDING",
      owner_id: args.ownerId,
      plan: "pro",
      currency: "EUR",
      timezone: "Europe/Madrid",
      status: "active",
      active: true,
      email: "admin@example.com",
      city: "Ciudad",
      postal_code: "00000",
      country: "España",
      created_at: Date.now(),
    });
    
    return await ctx.db.get(newId);
  },
});
