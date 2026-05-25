import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// --- QUERIES ---

export const getEventLogs = query({
  args: { 
    establishmentId: v.id("establishments"),
    paginationOpts: paginationOptsValidator,
    type: v.optional(v.union(v.literal("security"), v.literal("inventory"), v.literal("operational"), v.literal("financial"))),
    level: v.optional(v.union(v.literal("info"), v.literal("warning"), v.literal("critical")))
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("event_log")
      .withIndex("by_establishment_timestamp", q => q.eq("establishment_id", args.establishmentId))
      .order("desc");

    // Apply filters
    if (args.type) {
      q = q.filter(q => q.eq(q.field("type"), args.type));
    }
    
    if (args.level) {
      q = q.filter(q => q.eq(q.field("level"), args.level));
    }

    const result = await q.paginate(args.paginationOpts);
    
    // Get staff details for actor information
    const eventsWithActorDetails = await Promise.all(
      result.page.map(async (event) => {
        let actorName = "Sistema";
        let actorType = "system";
        
        if (event.actor !== "system") {
          // Check if it's a staff ID by trying to get from staff table
          try {
            const staff = await ctx.db.get(event.actor as any);
            if (staff && "name" in staff && "role" in staff) {
              actorName = `${staff.name || ""} ${("last_name" in staff ? staff.last_name : "") || ""}`.trim();
              actorType = staff.role || "unknown";
            }
          } catch (error) {
            // If it's not a staff record, keep default values
            console.log("Actor is not a staff record:", event.actor);
          }
        }
        
        return {
          id: event._id,
          event: event.action,
          actor: actorName,
          actorType: actorType,
          detail: formatEventDetails(event),
          type: mapTypeToUI(event.type),
          level: event.level,
          timestamp: event.timestamp,
          icon: getIconForEvent(event.type, event.action),
          entityType: event.entity_type,
          entityId: event.entity_id,
          before: event.before,
          after: event.after
        };
      })
    );

    return {
      ...result,
      page: eventsWithActorDetails
    };
  },
});

export const getEventLogsByTimeRange = query({
  args: { 
    establishmentId: v.id("establishments"),
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("event_log")
      .withIndex("by_establishment_timestamp", q => 
        q.eq("establishment_id", args.establishmentId)
         .gte("timestamp", args.startTime)
         .lte("timestamp", args.endTime)
      )
      .order("desc")
      .collect();

    if (args.limit) {
      events = events.slice(0, args.limit);
    }
    
    // Get staff details for actor information
    const eventsWithActorDetails = await Promise.all(
      events.map(async (event) => {
        let actorName = "Sistema";
        let actorType = "system";
        
        if (event.actor !== "system") {
          // Check if it's a staff ID by trying to get from staff table
          try {
            const staff = await ctx.db.get(event.actor as any);
            if (staff && "name" in staff && "role" in staff) {
              actorName = `${staff.name || ""} ${("last_name" in staff ? staff.last_name : "") || ""}`.trim();
              actorType = staff.role || "unknown";
            }
          } catch (error) {
            // If it's not a staff record, keep default values
            console.log("Actor is not a staff record:", event.actor);
          }
        }
        
        return {
          id: event._id,
          event: event.action,
          actor: actorName,
          actorType: actorType,
          detail: formatEventDetails(event),
          type: mapTypeToUI(event.type),
          level: event.level,
          timestamp: event.timestamp,
          icon: getIconForEvent(event.type, event.action),
          entityType: event.entity_type,
          entityId: event.entity_id,
          before: event.before,
          after: event.after
        };
      })
    );

    return eventsWithActorDetails;
  },
});

// --- MUTATIONS ---

export const createEventLog = mutation({
  args: {
    establishmentId: v.id("establishments"),
    type: v.union(v.literal("security"), v.literal("inventory"), v.literal("operational"), v.literal("financial")),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    actor: v.union(v.id("staff"), v.literal("system")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    ipAddress: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: args.type,
      level: args.level,
      actor: args.actor,
      action: args.action,
      entity_type: args.entityType,
      entity_id: args.entityId,
      before: args.before,
      after: args.after,
      timestamp: Date.now(),
      ip_address: args.ipAddress,
    });

    return eventId;
  },
});

// Helper mutations for common events
export const logStaffEvent = mutation({
  args: {
    establishmentId: v.id("establishments"),
    staffId: v.id("staff"),
    action: v.string(),
    details: v.optional(v.any()),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("critical"))
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: args.level,
      actor: args.staffId,
      action: args.action,
      entity_type: "staff",
      entity_id: args.staffId,
      before: args.details?.before,
      after: args.details?.after,
      timestamp: Date.now(),
    });
  },
});

export const logInventoryEvent = mutation({
  args: {
    establishmentId: v.id("establishments"),
    action: v.string(),
    productName: v.string(),
    details: v.optional(v.any()),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("critical"))
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "inventory",
      level: args.level,
      actor: "system",
      action: args.action,
      entity_type: "product",
      entity_id: args.productName,
      before: args.details?.before,
      after: args.details?.after,
      timestamp: Date.now(),
    });
  },
});

export const logFinancialEvent = mutation({
  args: {
    establishmentId: v.id("establishments"),
    action: v.string(),
    details: v.optional(v.any()),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("critical"))
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "financial",
      level: args.level,
      actor: "system",
      action: args.action,
      entity_type: "payment",
      entity_id: args.details?.paymentId || "unknown",
      before: args.details?.before,
      after: args.details?.after,
      timestamp: Date.now(),
    });
  },
});

// --- HELPER FUNCTIONS ---

function formatEventDetails(event: any): string {
  const { action, entity_type, after } = event;
  
  // Staff events
  if (entity_type === "time_log") {
    if (after?.location && after?.location !== "establecimiento") {
      return `Inició turno en ${after.location}`;
    }
    return after?.action === "clock_out" ? "Finalizó turno" : "Registro de fichaje";
  }
  
  if (entity_type === "absence_request") {
    const typeMap = {
      "vacation": "vacaciones",
      "sick_leave": "baja por enfermedad", 
      "personal_days": "días personales",
      "other": "otros"
    };
    const days = after?.total_days || 1;
    const type = typeMap[after?.type as keyof typeof typeMap] || "ausencia";
    return `Solicitó ${days} día${days > 1 ? 's' : ''} de ${type}`;
  }
  
  // Inventory events
  if (entity_type === "ingredient") {
    if (action === "Alerta de Stock") {
      const stock = after?.stock || 0;
      const min = after?.alert_min || 10;
      return `Stock de ${after?.ingredient_name} bajo (${stock} unidades - mínimo: ${min})`;
    }
    if (action === "Pedido Stock") {
      return `Pedido confirmado (${after?.ingredient_name})`;
    }
    return `Ajuste de inventario (${after?.ingredient_name})`;
  }
  
  // Financial events
  if (entity_type === "payment") {
    const amount = after?.total_amount || 0;
    const method = after?.payment_method || "desconocido";
    const table = after?.table_number || "Para llevar";
    return `Ticket pagado por ${method} (${table}) - ${amount.toFixed(2)}${amount ? 'EUR' : ''}`;
  }
  
  // Environment events
  if (entity_type === "environment") {
    const percentage = after?.occupancy_percentage || 0;
    const name = after?.environment_name || "Ambiente";
    return `Ocupación del ${name} al ${percentage}%`;
  }
  
  // Default format
  if (after) {
    const details = Object.entries(after)
      .filter(([key, value]) => key !== 'staff_name' && value !== null && value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return details || `${entity_type} - ${action}`;
  }
  
  return action;
}

function mapTypeToUI(type: string): string {
  switch (type) {
    case "security": return "staff";
    case "inventory": return "inventory";
    case "operational": return "staff";
    case "financial": return "payment";
    default: return "general";
  }
}

function getIconForEvent(type: string, action: string): string {
  // This would return icon names that can be mapped in the UI
  // For now, return generic icons based on type and action
  if (action.includes("check-in") || action.includes("fichar")) return "UserPlus";
  if (action.includes("check-out") || action.includes("salida")) return "UserMinus";
  if (action.includes("stock") || action.includes("inventario")) return "Package";
  if (action.includes("pago") || action.includes("payment")) return "CreditCard";
  if (action.includes("reserva") || action.includes("booking")) return "Calendar";
  if (action.includes("descanso") || action.includes("break")) return "Coffee";
  if (action.includes("alerta") || action.includes("warning")) return "AlertTriangle";
  if (action.includes("incidencia") || action.includes("incident")) return "Clock";
  if (action.includes("ambiente") || action.includes("environment")) return "AlertTriangle";
  
  return "Info"; // Default icon
}
