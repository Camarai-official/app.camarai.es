import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * BORRA TODA LA BASE DE DATOS - USAR CON EXTREMA PRECAUCIÓN
 * Esta mutation elimina todos los datos de todas las tablas
 * Solo para desarrollo/pruebas - NUNCA usar en producción
 */
export const eraseAllData = internalMutation({
  args: {
    confirmation: v.literal("ERASE_ALL_DATA_CONFIRMED"),
  },
  handler: async (ctx) => {
    console.log("=== INICIANDO BORRADO COMPLETO DE BASE DE DATOS ===");
    
    // Lista de todas las tablas en orden de dependencia
    const tables = [
      // Tablas de auditoría y logs (sin dependencias fuertes)
      "event_log",
      "audit_log",
      "payment_audit",
      
      // Tablas de comunicación
      "messages",
      "conversations",
      
      // Tablas de marketing
      "coupons",
      "campaigns",
      "customer_tags",
      "notifications",
      
      // Tablas de sesiones y verificación
      "qr_sessions",
      "table_sessions",
      "verification_codes",
      
      // Tablas de operaciones financieras
      "purchase_items",
      "purchases",
      "stock_movements",
      "cash_registers",
      "invoices",
      "payments",
      
      // Tablas de integraciones
      "integration_orders",
      "integrations",
      "whatsapp_config",
      
      // Tablas de KPIs y análisis
      "performance_kpis",
      "establishment_statistics",
      "company_profit_analysis",
      "profit_analysis",
      "month_kpi_establishment",
      "establishment_kpis",
      
      // Tablas de recursos humanos
      "clock_incidents",
      "absence_requests",
      "staff_planning",
      "time_logs",
      "clock_devices",
      
      // Tablas de operaciones
      "order_items",
      "orders",
      "reservations",
      
      // Tablas de catálogo
      "product_ingredients",
      "ingredients",
      "ingredient_categories",
      "products",
      "categories",
      "menu_sections",
      "menu",
      "taxes",
      
      // Tablas de infraestructura
      "tables",
      "environments",
      "devices",
      
      // Tablas de clientes y proveedores
      "customers",
      "suppliers",
      
      // Tablas de configuración
      "establishment_settings",
      "notification_settings",
      "system_configs",
      
      // Tablas de staff y roles
      "user_roles",
      "staff",
      "roles",
      "permissions",
      
      // Tablas de suscripciones
      "subscriptions",
      
      // Tablas principales
      "establishments",
      "companies",
      "subscription_plans"
    ];

    let totalDeleted = 0;

    for (const tableName of tables) {
      try {
        // Obtener todos los documentos de la tabla
        const documents = await ctx.db.query(tableName as any).collect();
        
        if (documents.length > 0) {
          // Borrar cada documento
          for (const doc of documents) {
            await ctx.db.delete(doc._id);
          }
          
          console.log(`Borrados ${documents.length} documentos de la tabla: ${tableName}`);
          totalDeleted += documents.length;
        } else {
          console.log(`Tabla ${tableName} ya estaba vacía`);
        }
      } catch (error) {
        console.error(`Error borrando tabla ${tableName}:`, error);
      }
    }

    console.log(`=== BORRADO COMPLETADO ===`);
    console.log(`Total de documentos borrados: ${totalDeleted}`);
    
    return {
      success: true,
      totalDeleted,
      message: "Todos los datos han sido borrados correctamente"
    };
  },
});

/**
 * BORRA SOLO LOS EVENT_LOGS - Para limpiar notificaciones
 */
export const eraseEventLogs = internalMutation({
  args: {
    establishmentId: v.optional(v.id("establishments")),
  },
  handler: async (ctx, args) => {
    console.log("=== BORRANDO EVENT LOGS ===");
    
    let events;
    
    if (args.establishmentId) {
      events = await ctx.db
        .query("event_log")
        .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId!))
        .collect();
    } else {
      events = await ctx.db.query("event_log").collect();
    }
    
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    
    console.log(`Borrados ${events.length} eventos${args.establishmentId ? ` del establecimiento ${args.establishmentId}` : ""}`);
    
    return {
      success: true,
      deletedCount: events.length,
      message: `Borrados ${events.length} eventos del log`
    };
  },
});