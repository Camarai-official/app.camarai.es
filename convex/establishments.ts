import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const updateEstablishment = mutation({
  args: {
    id: v.id("establishments"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    operating_hours: v.optional(v.any()),
    legal_name: v.optional(v.string()),
    active: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("trial"), v.literal("suspended"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Sync status with active boolean if provided
    if (updates.active !== undefined) {
      (updates as any).status = updates.active ? "active" : "suspended";
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteEstablishment = mutation({
  args: { id: v.id("establishments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});



async function initializeEstablishmentData(ctx: any, establishmentId: any) {
  // Create default taxes
  await ctx.db.insert("taxes", {
    establishment_id: establishmentId,
    name: "IVA 10%",
    percentage: 10,
    is_default: true,
    created_at: Date.now(),
  });

  // Create default settings
  await ctx.db.insert("establishment_settings", {
    establishment_id: establishmentId,
    clock_methods: ["app", "qr", "web"],
    auto_incident_detection: true,
    max_late_minutes: 15,
    break_duration_minutes: 30,
    workday_start: "09:00",
    workday_end: "18:00",
    overtime_alert: true,
    clock_in_channels: {
      mobile_app: true,
      whatsapp: false,
      qr_code: true,
      web_panel: true
    },
    whatsapp_integration: {
      enabled: false,
      status: "disconnected",
      auto_send_clock_in: false,
      default_action: "clock_in",
      confirmation_required: true,
    },
    channel_usage_stats: {
      whatsapp: 0,
      mobile_app: 0,
      qr_code: 0,
      web_panel: 0,
      total_clock_ins: 0
    },
    created_at: Date.now(),
    updated_at: Date.now(),
  });
}

export const createFirstEstablishment = mutation({
  args: {
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Create a default subscription plan
    const planId = await ctx.db.insert("subscription_plans", {
      name: "PAID Plan",
      description: "Plan inicial de pago",
      price: 100,
      billing_cycle: "monthly",
      max_users: 5,
      max_establishments: 1,
      active: true,
      created_at: Date.now(),
    });

    // 2. Create the company
    const companyId = await ctx.db.insert("companies", {
      name: `${args.name} Group`,
      legal_name: args.name,
      nif: "PENDING",
      email: "admin@example.com",
      country: "España",
      plan_id: planId,
      plan_start_date: Date.now(),
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 3. Create the establishment
    const establishmentId = await ctx.db.insert("establishments", {
      company_id: companyId,
      name: args.name,
      cif: "PENDING",
      owner_id: args.ownerId,
      plan: "pro",
      currency: "EUR",
      timezone: "Europe/Madrid",
      status: "active",
      email: "admin@example.com",
      city: "Ciudad",
      postal_code: "00000",
      country: "España",
      active: true,
      created_at: Date.now(),
    });

    await initializeEstablishmentData(ctx, establishmentId);

    return establishmentId;
  },
});

export const createEstablishment = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    type: v.string(),
    address: v.string(),
    city: v.string(),
    postal_code: v.string(),
    country: v.string(),
    email: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const establishmentId = await ctx.db.insert("establishments", {
      company_id: args.companyId,
      name: args.name,
      cif: "PENDING",
      owner_id: args.ownerId,
      plan: "pro",
      currency: "EUR",
      timezone: "Europe/Madrid",
      status: "active",
      email: args.email,
      address: args.address,
      city: args.city,
      postal_code: args.postal_code,
      country: args.country,
      active: true,
      created_at: Date.now(),
    });

    await initializeEstablishmentData(ctx, establishmentId);

    return establishmentId;
  },
});
