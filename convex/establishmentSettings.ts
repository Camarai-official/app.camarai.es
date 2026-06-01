import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// --- QUERIES ---

export const getEstablishmentSettings = query({
  args: {
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    return settings;
  },
});

export const getClockInChannels = query({
  args: {
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    return settings?.clock_in_channels || {
      mobile_app: true,
      whatsapp: false,
      qr_code: true,
      web_panel: true
    };
  },
});

export const getWhatsAppIntegration = query({
  args: {
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    return settings?.whatsapp_integration || {
      enabled: false,
      status: "disconnected",
      qr_code: undefined,
      phone_number: undefined,
      auto_send_clock_in: false,
      default_action: "clock_in",
      confirmation_required: true,
      last_sync: undefined
    };
  },
});

export const getChannelUsageStats = query({
  args: {
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    return settings?.channel_usage_stats || {
      whatsapp: 0,
      mobile_app: 0,
      qr_code: 0,
      web_panel: 0,
      total_clock_ins: 0
    };
  },
});

// --- MUTATIONS ---

export const createOrUpdateEstablishmentSettings = mutation({
  args: {
    establishmentId: v.id("establishments"),
    clockMethods: v.optional(v.array(v.string())),
    autoIncidentDetection: v.optional(v.boolean()),
    maxLateMinutes: v.optional(v.number()),
    breakDurationMinutes: v.optional(v.number()),
    workdayStart: v.optional(v.string()),
    workdayEnd: v.optional(v.string()),
    overtimeAlert: v.optional(v.boolean()),
    clockInChannels: v.optional(v.object({
      mobile_app: v.boolean(),
      whatsapp: v.boolean(),
      qr_code: v.boolean(),
      web_panel: v.boolean()
    })),
    whatsappIntegration: v.optional(v.object({
      enabled: v.boolean(),
      status: v.union(v.literal("connected"), v.literal("disconnected"), v.literal("error")),
      qr_code: v.optional(v.string()),
      phone_number: v.optional(v.string()),
      auto_send_clock_in: v.boolean(),
      default_action: v.union(v.literal("clock_in"), v.literal("clock_out")),
      confirmation_required: v.boolean(),
      last_sync: v.optional(v.number())
    })),
    channelUsageStats: v.optional(v.object({
      whatsapp: v.number(),
      mobile_app: v.number(),
      qr_code: v.number(),
      web_panel: v.number(),
      total_clock_ins: v.number()
    })),
    tableSettings: v.optional(v.object({
      reservation_buffer_minutes: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    if (!existingSettings) {
      throw new Error("No se encontraron ajustes para este establecimiento. Debe inicializarse primero.");
    }

    const updates: any = {
        updated_at: now
    };

    if (args.clockMethods !== undefined) updates.clock_methods = args.clockMethods;
    if (args.autoIncidentDetection !== undefined) updates.auto_incident_detection = args.autoIncidentDetection;
    if (args.maxLateMinutes !== undefined) updates.max_late_minutes = args.maxLateMinutes;
    if (args.breakDurationMinutes !== undefined) updates.break_duration_minutes = args.breakDurationMinutes;
    if (args.workdayStart !== undefined) updates.workday_start = args.workdayStart;
    if (args.workdayEnd !== undefined) updates.workday_end = args.workdayEnd;
    if (args.overtimeAlert !== undefined) updates.overtime_alert = args.overtimeAlert;
    if (args.clockInChannels !== undefined) updates.clock_in_channels = args.clockInChannels;
    if (args.whatsappIntegration !== undefined) updates.whatsapp_integration = args.whatsappIntegration;
    if (args.channelUsageStats !== undefined) updates.channel_usage_stats = args.channelUsageStats;
    if (args.tableSettings !== undefined) updates.table_settings = args.tableSettings;

    await ctx.db.patch(existingSettings._id, updates);
    return existingSettings._id;
  },
});

export const updateClockInChannels = mutation({
  args: {
    establishmentId: v.id("establishments"),
    channels: v.object({
      mobile_app: v.boolean(),
      whatsapp: v.boolean(),
      qr_code: v.boolean(),
      web_panel: v.boolean()
    })
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    if (!existingSettings) {
      throw new Error("Ajustes no encontrados");
    }

    await ctx.db.patch(existingSettings._id, {
      clock_in_channels: args.channels,
      updated_at: Date.now(),
    });
    return existingSettings._id;
  },
});

export const updateWhatsAppIntegration = mutation({
  args: {
    establishmentId: v.id("establishments"),
    integration: v.object({
      enabled: v.boolean(),
      status: v.union(v.literal("connected"), v.literal("disconnected"), v.literal("error")),
      qr_code: v.optional(v.string()),
      phone_number: v.optional(v.string()),
      auto_send_clock_in: v.boolean(),
      default_action: v.union(v.literal("clock_in"), v.literal("clock_out")),
      confirmation_required: v.boolean(),
      last_sync: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    if (!existingSettings) {
      throw new Error("Ajustes no encontrados");
    }

    await ctx.db.patch(existingSettings._id, {
      whatsapp_integration: args.integration,
      updated_at: Date.now(),
    });
    return existingSettings._id;
  },
});

export const updateChannelUsageStats = mutation({
  args: {
    establishmentId: v.id("establishments"),
    stats: v.object({
      whatsapp: v.number(),
      mobile_app: v.number(),
      qr_code: v.number(),
      web_panel: v.number(),
      total_clock_ins: v.number()
    })
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    if (!existingSettings) {
      throw new Error("Ajustes no encontrados");
    }

    await ctx.db.patch(existingSettings._id, {
      channel_usage_stats: args.stats,
      updated_at: Date.now(),
    });
    return existingSettings._id;
  },
});

export const incrementChannelUsage = mutation({
  args: {
    establishmentId: v.id("establishments"),
    channel: v.union(v.literal("whatsapp"), v.literal("mobile_app"), v.literal("qr_code"), v.literal("web_panel"))
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .unique();

    if (!existingSettings) {
      throw new Error("Ajustes no encontrados");
    }

    const currentStats = existingSettings.channel_usage_stats;
    const updatedStats = {
      ...currentStats,
      [args.channel]: currentStats[args.channel] + 1,
      total_clock_ins: currentStats.total_clock_ins + 1
    };

    await ctx.db.patch(existingSettings._id, {
      channel_usage_stats: updatedStats,
      updated_at: Date.now(),
    });

    return existingSettings._id;
  },
});
