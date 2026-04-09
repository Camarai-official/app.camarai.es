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
      .first();

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
      .first();

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
      .first();

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
      .first();

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
    }))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if settings already exist
    const existingSettings = await ctx.db
      .query("establishment_settings")
      .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
      .first();

    const settingsData = {
      establishment_id: args.establishmentId,
      clock_methods: args.clockMethods || ["app", "qr", "web"],
      auto_incident_detection: args.autoIncidentDetection ?? true,
      max_late_minutes: args.maxLateMinutes ?? 15,
      break_duration_minutes: args.breakDurationMinutes ?? 30,
      workday_start: args.workdayStart ?? "09:00",
      workday_end: args.workdayEnd ?? "18:00",
      overtime_alert: args.overtimeAlert ?? true,
      clock_in_channels: args.clockInChannels || {
        mobile_app: true,
        whatsapp: false,
        qr_code: true,
        web_panel: true
      },
      whatsapp_integration: args.whatsappIntegration || {
        enabled: false,
        status: "disconnected",
        qr_code: undefined,
        phone_number: undefined,
        auto_send_clock_in: false,
        default_action: "clock_in",
        confirmation_required: true,
        last_sync: undefined
      },
      channel_usage_stats: args.channelUsageStats || {
        whatsapp: 0,
        mobile_app: 0,
        qr_code: 0,
        web_panel: 0,
        total_clock_ins: 0
      },
      created_at: existingSettings?.created_at || now,
      updated_at: now,
    };

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, settingsData);
      return existingSettings._id;
    } else {
      // Create new settings
      const settingsId = await ctx.db.insert("establishment_settings", settingsData);
      return settingsId;
    }
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
      .first();

    const now = Date.now();

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        clock_in_channels: args.channels,
        updated_at: now,
      });
      return existingSettings._id;
    } else {
      // Create default settings if they don't exist
      const settingsId = await ctx.db.insert("establishment_settings", {
        establishment_id: args.establishmentId,
        clock_methods: ["app", "qr", "web"],
        auto_incident_detection: true,
        max_late_minutes: 15,
        break_duration_minutes: 30,
        workday_start: "09:00",
        workday_end: "18:00",
        overtime_alert: true,
        
        // Use the provided channels
        clock_in_channels: args.channels,
        
        // Default WhatsApp integration
        whatsapp_integration: {
          enabled: false,
          status: "disconnected",
          qr_code: undefined,
          phone_number: undefined,
          auto_send_clock_in: false,
          default_action: "clock_in",
          confirmation_required: true,
          last_sync: undefined
        },
        
        // Default usage stats
        channel_usage_stats: {
          whatsapp: 0,
          mobile_app: 0,
          qr_code: 0,
          web_panel: 0,
          total_clock_ins: 0
        },
        
        created_at: now,
        updated_at: now,
      });
      return settingsId;
    }
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
      .first();

    const now = Date.now();

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        whatsapp_integration: args.integration,
        updated_at: now,
      });
      return existingSettings._id;
    } else {
      // Create default settings if they don't exist
      const settingsId = await ctx.db.insert("establishment_settings", {
        establishment_id: args.establishmentId,
        clock_methods: ["app", "qr", "web"],
        auto_incident_detection: true,
        max_late_minutes: 15,
        break_duration_minutes: 30,
        workday_start: "09:00",
        workday_end: "18:00",
        overtime_alert: true,
        
        // Default clock channels
        clock_in_channels: {
          mobile_app: true,
          whatsapp: false,
          qr_code: true,
          web_panel: true
        },
        
        // Use the provided WhatsApp integration
        whatsapp_integration: args.integration,
        
        // Default usage stats
        channel_usage_stats: {
          whatsapp: 0,
          mobile_app: 0,
          qr_code: 0,
          web_panel: 0,
          total_clock_ins: 0
        },
        
        created_at: now,
        updated_at: now,
      });
      return settingsId;
    }
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
      .first();

    const now = Date.now();

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        channel_usage_stats: args.stats,
        updated_at: now,
      });
      return existingSettings._id;
    } else {
      // Create default settings if they don't exist
      const settingsId = await ctx.db.insert("establishment_settings", {
        establishment_id: args.establishmentId,
        clock_methods: ["app", "qr", "web"],
        auto_incident_detection: true,
        max_late_minutes: 15,
        break_duration_minutes: 30,
        workday_start: "09:00",
        workday_end: "18:00",
        overtime_alert: true,
        
        // Default clock channels
        clock_in_channels: {
          mobile_app: true,
          whatsapp: false,
          qr_code: true,
          web_panel: true
        },
        
        // Default WhatsApp integration
        whatsapp_integration: {
          enabled: false,
          status: "disconnected",
          qr_code: undefined,
          phone_number: undefined,
          auto_send_clock_in: false,
          default_action: "clock_in",
          confirmation_required: true,
          last_sync: undefined
        },
        
        // Use the provided usage stats
        channel_usage_stats: args.stats,
        
        created_at: now,
        updated_at: now,
      });
      return settingsId;
    }
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
      .first();

    const now = Date.now();

    if (existingSettings) {
      // Update existing settings
      const currentStats = existingSettings.channel_usage_stats;
      const updatedStats = {
        ...currentStats,
        [args.channel]: currentStats[args.channel] + 1,
        total_clock_ins: currentStats.total_clock_ins + 1
      };

      await ctx.db.patch(existingSettings._id, {
        channel_usage_stats: updatedStats,
        updated_at: now,
      });

      return existingSettings._id;
    } else {
      // Create default settings if they don't exist
      const defaultStats = {
        whatsapp: 0,
        mobile_app: 0,
        qr_code: 0,
        web_panel: 0,
        total_clock_ins: 0
      };
      
      const updatedStats = {
        ...defaultStats,
        [args.channel]: 1,
        total_clock_ins: 1
      };

      const settingsId = await ctx.db.insert("establishment_settings", {
        establishment_id: args.establishmentId,
        clock_methods: ["app", "qr", "web"],
        auto_incident_detection: true,
        max_late_minutes: 15,
        break_duration_minutes: 30,
        workday_start: "09:00",
        workday_end: "18:00",
        overtime_alert: true,
        
        // Default clock channels
        clock_in_channels: {
          mobile_app: true,
          whatsapp: false,
          qr_code: true,
          web_panel: true
        },
        
        // Default WhatsApp integration
        whatsapp_integration: {
          enabled: false,
          status: "disconnected",
          qr_code: undefined,
          phone_number: undefined,
          auto_send_clock_in: false,
          default_action: "clock_in",
          confirmation_required: true,
          last_sync: undefined
        },
        
        // Use the updated usage stats
        channel_usage_stats: updatedStats,
        
        created_at: now,
        updated_at: now,
      });
      return settingsId;
    }
  },
});
