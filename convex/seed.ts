import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Script de Seed Actualizado para el Nuevo Esquema Aplanado de Camarai
 * Llena la base de datos con un establecimiento real de prueba y su catálogo operativo.
 */
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // 0. PRIMERO CREAR SUBSCRIPTION PLAN
    const planId = await ctx.db.insert("subscription_plans", {
      name: "Pro Plan",
      description: "Plan profesional para restaurantes",
      price: 9900, // 99.00€ en cents
      billing_cycle: "monthly",
      max_users: 10,
      max_establishments: 3,
      active: true,
      created_at: Date.now(),
    });

    // 1. CREAR LA COMPAÑÍA (requerida por el schema multi-tenant)
    const companyId = await ctx.db.insert("companies", {
      name: "Camarai Group S.L.",
      legal_name: "Camarai Group S.L.",
      nif: "B12345678",
      email: "admin@camarai.es",
      country: "España",
      plan_id: planId,
      plan_start_date: Date.now(),
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 2. ESTABLECIMIENTO (Aplanado)
    const establishmentId = await ctx.db.insert("establishments", {
      company_id: companyId,
      name: "Camarai Gastrobar",
      legal_name: "Camarai Restauración S.L.",
      cif: "B12345678",
      owner_id: "user_owner_01",
      plan: "pro",
      currency: "EUR",
      timezone: "Europe/Madrid",
      status: "active",
      phone: "+34 900 000 000",
      email: "gerencia@camarai.es",
      address: "Calle Gran Vía 1",
      city: "Madrid",
      province: "Madrid",
      postal_code: "28001",
      country: "España",
      logo_url: "https://camarai.es/logo.png",
      created_at: Date.now(),
    });

    // 2. IMPUESTOS
    const taxId = await ctx.db.insert("taxes", {
      establishment_id: establishmentId,
      name: "IVA 10%",
      percentage: 10,
      is_default: true,
      created_at: Date.now(),
    });

    // 3. STAFF
    const staffId = await ctx.db.insert("staff", {
      establishment_id: establishmentId,
      name: "Miguel",
      last_name: "Riu",
      role: "admin",
      phone: "+34 630 387 653",
      status: "active",
      contract_type: "indefinite",
      contract_start: Date.now() - 31536000000,
      salary: 4500000, // Céntimos
      irpf: 15,
      dashboard_sections: ["sales", "inventory", "marketing"],
      clock_methods: ["qr", "app"],
      created_at: Date.now(),
    });

    // 3b. STAFF VIRTUAL (Sistema) — para órdenes automáticas desde WhatsApp
    const systemStaffId = await ctx.db.insert("staff", {
      establishment_id: establishmentId,
      name: "CamarAI",
      last_name: "Sistema",
      role: "system",
      status: "active",
      contract_type: "indefinite",
      contract_start: Date.now(),
      salary: 0,
      irpf: 0,
      dashboard_sections: [],
      clock_methods: [],
      created_at: Date.now(),
    });

    // 4. CATEGORÍAS
    const categoryId = await ctx.db.insert("categories", {
      establishment_id: establishmentId,
      name: "Hamburguesas",
      order: 1,
      active: true,
      visibleInMenu: true,
      created_at: Date.now(),
    });

    // 5. INGREDIENTES (Para Recetas)
    const ingredientCatId = await ctx.db.insert("ingredient_categories", {
      establishment_id: establishmentId,
      name: "Carnes",
      order: 1,
      created_at: Date.now(),
    });

    const ingredientId = await ctx.db.insert("ingredients", {
      establishment_id: establishmentId,
      category_id: ingredientCatId,
      name: "Carne de Buey 200g",
      stock: 50,
      alert_min: 10,
      unit: "units",
      cost_base: 250, // 2.50€
      created_at: Date.now(),
    });

    // 6. PRODUCTOS (Vinculado a Impuestos y Categoría)
    const productId = await ctx.db.insert("products", {
      establishment_id: establishmentId,
      category_id: categoryId,
      name: "Burger Camarai",
      description: "Nuestra hamburguesa estrella",
      price: 1250, // 12.50€
      cost: 450,   // 4.50€
      tax_id: taxId,
      active: true,
      is_elaborated: true,
      allergens: ["gluten", "lactosa"],
      preparation_time: 15,
      available_pos: true,
      available_delivery: true,
      stock_minimo: 10,
      impresora_destino: "cocina",
      order: 1,
      created_at: Date.now(),
    });

    // 7. RECETAS (product_ingredients)
    await ctx.db.insert("product_ingredients", {
      product_id: productId,
      ingredient_id: ingredientId,
      quantity_required: 1,
      unit: "units",
    });

    // 8. INFRAESTRUCTURA (Ambientes y Mesas)
    const envId = await ctx.db.insert("environments", {
      establishment_id: establishmentId,
      name: "Sala Principal",
      capacity: 40,
      status: "active",
      order: 1,
      created_at: Date.now(),
    });

    const tableId = await ctx.db.insert("tables", {
      environment_id: envId,
      number: 1,
      capacity: 4,
      status: "free",
      x: 100, y: 100, width: 80, height: 80, rotation: 0,
      shape: "square",
    });

    // 9. CLIENTES
    const customerId = await ctx.db.insert("customers", {
      establishments_id: [establishmentId],
      name: "Cliente VIP",
      phone: "+34 600 000 000",
      points: 100,
      total_visits: 1,
      total_spent: 1250,
      average_ticket: 1250,
      allergens: ["marisco"],
      source: "manual",
      created_at: Date.now(),
    });

    // 10. CONFIGURACIÓN DEL ESTABLECIMIENTO
    await ctx.db.insert("establishment_settings", {
      establishment_id: establishmentId,
      clock_methods: ["app", "qr", "web"],
      auto_incident_detection: true,
      max_late_minutes: 15,
      break_duration_minutes: 30,
      workday_start: "09:00",
      workday_end: "18:00",
      overtime_alert: true,

      // Canales de fichaje
      clock_in_channels: {
        mobile_app: true,
        whatsapp: false,
        qr_code: true,
        web_panel: true
      },

      // Integración WhatsApp
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

      // Estadísticas de uso
      channel_usage_stats: {
        whatsapp: 0,
        mobile_app: 0,
        qr_code: 0,
        web_panel: 0,
        total_clock_ins: 0
      },

      // Gestión de mesas
      table_settings: {
        reservation_buffer_minutes: 60,
      },
      
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 11. ROLES Y PERMISOS
    const adminRoleId = await ctx.db.insert("roles", {
      company_id: companyId,
      name: "Administrador",
      description: "Acceso completo al sistema",
      permissions: ["all"],
      is_system: true,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    const managerRoleId = await ctx.db.insert("roles", {
      company_id: companyId,
      name: "Gerente",
      description: "Gestión del establecimiento",
      permissions: ["orders", "staff", "inventory", "reports"],
      is_system: false,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await ctx.db.insert("permissions", {
      name: "Gestión de Órdenes",
      slug: "orders",
      key: "orders",
      description: "Permite crear, modificar y cerrar órdenes",
      module: "orders",
      created_at: Date.now(),
    });

    await ctx.db.insert("permissions", {
      name: "Gestión de Personal",
      slug: "staff",
      key: "staff",
      description: "Permite gestionar el staff y fichajes",
      module: "staff",
      created_at: Date.now(),
    });

    // 12. SUBSCRIPTIONS
    await ctx.db.insert("subscriptions", {
      establishment_id: establishmentId,
      plan: "pro",
      monthly_fee: 9900,
      commission_per_order: 2,
      status: "active",
      billing_cycle: "monthly",
      next_billing_date: Date.now() + 2592000000,
      total_commissions_pending: 0,
      created_at: Date.now(),
    });

    // 13. NOTIFICATION SETTINGS
    await ctx.db.insert("notification_settings", {
      establishment_id: establishmentId,
      stock_alerts: true,
      stock_alert_channel: "whatsapp",
      reservation_alerts: true,
      reservation_reminder_hours: 24,
      clock_incident_alerts: true,
      order_cancellation_alerts: true,
      daily_summary: true,
      admin_email: "admin@camarai.es",
    });

    // 14. MENÚ Y SECCIONES
    const menuId = await ctx.db.insert("menu", {
      establishment_id: establishmentId,
      name: "Carta Principal",
      description: "Menú principal del restaurante",
      type: "carta",
      active: true,
      product_ids: [productId],
      available_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      order: 1,
      whatsapp_enabled: true,
      whatsapp_voice_enabled: false,
      whatsapp_welcome_message: "¡Bienvenido a Camarai Gastrobar!",
      whatsapp_schedule_start: "12:00",
      whatsapp_schedule_end: "23:00",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await ctx.db.insert("menu_sections", {
      menu_id: menuId,
      element_type: "category",
      element_id: categoryId,
      display_order: 1,
      created_at: Date.now(),
    });

    // 15. ORDENES Y PAGOS
    const orderId = await ctx.db.insert("orders", {
      establishment_id: establishmentId,
      table_id: tableId,
      staff_id: staffId,
      customer_id: customerId,
      order_number: "ORD-001",
      status: "paid",
      total_amount: 1250,
      subtotal: 1136,
      tax_amount: 114,
      discount_amount: 0,
      payment_type: "individual",
      source: "pos",
      guests: 2,
      is_commission_order: false,
      created_at: Date.now(),
      updated_at: Date.now(),
      closed_at: Date.now(),
    });

    await ctx.db.insert("order_items", {
      order_id: orderId,
      product_id: productId,
      product_name: "Burger Camarai",
      quantity: 1,
      unit_price: 1250,
      total_price: 1250,
      course: "first",
      item_status: "served",
      sent_to_kitchen_at: Date.now() - 900000,
      ready_at: Date.now() - 600000,
    });

    await ctx.db.insert("payments", {
      establishment_id: establishmentId,
      order_id: orderId,
      method: "card",
      amount: 1250,
      tip: 200,
      reference: "TXN-001",
      staff_id: staffId,
      timestamp: Date.now(),
    });

    // 16. CAJA REGISTRADORA
    await ctx.db.insert("cash_registers", {
      establishment_id: establishmentId,
      staff_id: staffId,
      status: "closed",
      opening_time: Date.now() - 28800000,
      closing_time: Date.now(),
      initial_balance: 50000,
      cash_sales: 30000,
      card_sales: 95000,
      withdrawals: 0,
      final_balance_real: 175000,
      difference: 0,
    });

    // 17. FACTURAS
    await ctx.db.insert("invoices", {
      establishment_id: establishmentId,
      order_id: orderId,
      customer_id: customerId,
      number: "FACT-001",
      series: "A",
      type: "simplified",
      status: "issued",
      total_amount: 1250,
      created_at: Date.now(),
    });

    // 18. RESERVAS
    await ctx.db.insert("reservations", {
      establishment_id: establishmentId,
      customer_id: customerId,
      table_id: tableId,
      customer_name: "Cliente VIP",
      customer_phone: "+34 600 000 000",
      date: "2026-04-18",
      start_time: "20:00",
      guests: 4,
      status: "confirmed",
      notified: true,
      source: "dashboard",
      reminder_sent: true,
      created_at: Date.now(),
    });

    // 19. TIME LOGS
    await ctx.db.insert("time_logs", {
      establishment_id: establishmentId,
      staff_id: staffId,
      action: "clock_in",
      timestamp: Date.now() - 28800000,
      method: "app",
      notes: "Fichaje matutino",
    });

    await ctx.db.insert("time_logs", {
      establishment_id: establishmentId,
      staff_id: staffId,
      action: "clock_out",
      timestamp: Date.now(),
      method: "app",
      notes: "Fichaje fin de jornada",
    });

    // 20. STAFF PLANNING
    await ctx.db.insert("staff_planning", {
      staff_id: staffId,
      establishment_id: establishmentId,
      date: "2026-04-18",
      start_time: "09:00",
      end_time: "18:00",
      is_custom: false,
    });

    // 21. CLOCK DEVICES
    await ctx.db.insert("clock_devices", {
      establishment_id: establishmentId,
      name: "Terminal Principal",
      type: "terminal",
      location: "Entrada principal",
      status: "online",
      token: "token_123456",
      intervalo_qr: 30,
      modo_offline: true,
      created_at: Date.now(),
    });

    // 22. DEVICES
    await ctx.db.insert("devices", {
      establishment_id: establishmentId,
      name: "Impresora Cocina",
      type: "printer",
      connection: "wifi",
      role: "kitchen",
      status: "online",
      created_at: Date.now(),
    });

    // 23. WHATSAPP CONFIG
    await ctx.db.insert("whatsapp_config", {
      establishment_id: establishmentId,
      instance_name: "camarai_whatsapp",
      api_url: "https://api.whatsapp.com",
      api_key: "key_123456",
      phone: "+34 600 123 456",
      status: "disconnected",
      active: false,
    });

    // 24. SUPPLIERS
    const supplierId = await ctx.db.insert("suppliers", {
      establishment_id: establishmentId,
      name: "Carnes Premium S.L.",
      contact_person: "Juan García",
      phone: "+34 900 111 222",
      email: "contacto@carnespremium.es",
      address: "Polígono Industrial, Calle A, Nave 5",
      nif: "B87654321",
      notes: "Proveedor principal de carnes",
      created_at: Date.now(),
    });

    // 25. NOTIFICATIONS
    await ctx.db.insert("notifications", {
      staff_id: staffId,
      title: "Bienvenido al sistema",
      message: "Tu cuenta ha sido configurada correctamente",
      type: "info",
      read: false,
      created_at: Date.now(),
    });

    // 26. ABSENCE REQUESTS
    await ctx.db.insert("absence_requests", {
      staff_id: staffId,
      establishment_id: establishmentId,
      type: "vacation",
      start_date: "2026-05-01",
      end_date: "2026-05-07",
      total_days: 7,
      reason: "Vacaciones familiares",
      status: "approved",
      reviewed_by: staffId,
      reviewed_at: Date.now(),
      created_at: Date.now(),
    });

    // 27. CLOCK INCIDENTS
    await ctx.db.insert("clock_incidents", {
      staff_id: staffId,
      establishment_id: establishmentId,
      type: "late_clock_in",
      description: "Fichaje 15 minutos tarde",
      status: "justified",
      detected_at: Date.now() - 86400000,
      resolved_by: staffId,
      resolved_at: Date.now() - 86400000,
      notes: "Tráfico intenso",
    });

    // 28. EVENT LOG
    await ctx.db.insert("event_log", {
      establishment_id: establishmentId,
      type: "operational",
      level: "info",
      actor: staffId,
      action: "order_created",
      entity_type: "orders",
      entity_id: orderId,
      before: null,
      after: { status: "open" },
      timestamp: Date.now(),
    });

    // 29. AUDIT LOG
    await ctx.db.insert("audit_log", {
      company_id: companyId,
      establishment_id: establishmentId,
      user_id: "user_owner_01",
      action: "CREATE",
      table_name: "orders",
      record_id: orderId,
      old_values: null,
      new_values: { order_number: "ORD-001" },
      timestamp: Date.now(),
    });

    // 30. PAYMENT AUDIT
    await ctx.db.insert("payment_audit", {
      company_id: companyId,
      establishment_id: establishmentId,
      order_id: orderId,
      payment_type: "individual",
      user_id: "user_owner_01",
      timestamp: Date.now(),
    });

    // 31. INTEGRATIONS
    const integrationId = await ctx.db.insert("integrations", {
      company_id: companyId,
      establishment_id: establishmentId,
      type: "tpv",
      name: "TPV Principal",
      config: { endpoint: "https://tpv.example.com/api" },
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 32. INTEGRATION ORDERS
    await ctx.db.insert("integration_orders", {
      company_id: companyId,
      establishment_id: establishmentId,
      integration_id: integrationId,
      external_id: "EXT-001",
      order_data: { items: [] },
      status: "entregado",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 33. ESTABLISHMENT KPIS
    await ctx.db.insert("establishment_kpis", {
      establishment_id: establishmentId,
      total_revenue: 125000,
      total_orders: 100,
      average_ticket: 1250,
      total_items_sold: 150,
      avg_service_time_ms: 900000,
      upsell_rate: 15,
      last_updated: Date.now(),
    });

    // 34. MONTH KPI ESTABLISHMENT
    await ctx.db.insert("month_kpi_establishment", {
      establishment_id: establishmentId,
      year_month: "2026-04",
      total_revenue: 3750000,
      total_orders: 3000,
      average_ticket: 1250,
      total_items_sold: 4500,
      last_updated: Date.now(),
    });

    // 35. CONVERSATIONS
    const conversationId = await ctx.db.insert("conversations", {
      establishment_id: establishmentId,
      channel_name: "General",
      channel_type: "general",
      participant_ids: ["user_owner_01", staffId],
      created_at: Date.now(),
    });

    // 36. MESSAGES
    await ctx.db.insert("messages", {
      conversation_id: conversationId,
      sender_id: staffId,
      content: "Hola equipo, buen día",
      message_type: "text",
      timestamp: Date.now(),
    });

    // 37. CAMPAIGNS
    await ctx.db.insert("campaigns", {
      establishment_id: establishmentId,
      name: "Promo Verano",
      message_template: "¡Oferta especial de verano!",
      status: "draft",
      created_at: Date.now(),
    });

    // 38. COUPONS
    await ctx.db.insert("coupons", {
      establishment_id: establishmentId,
      code: "VERANO2026",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 2000,
      usage_limit: 100,
      used_count: 5,
      valid_from: Date.now(),
      valid_until: Date.now() + 7776000000,
      is_active: true,
      created_at: Date.now(),
    });

    // 39. CUSTOMER TAGS
    await ctx.db.insert("customer_tags", {
      establishment_id: establishmentId,
      name: "VIP",
      color: "#FFD700",
      created_at: Date.now(),
    });

    // 40. TABLE SESSIONS
    await ctx.db.insert("table_sessions", {
      table_id: tableId,
      session_code: "SESSION-001",
      status: "closed",
      start_time: Date.now() - 3600000,
      end_time: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 41. VERIFICATION CODES
    await ctx.db.insert("verification_codes", {
      code: "123456",
      phone_number: "+34 600 000 000",
      status: "verified",
      expires_at: Date.now() + 300000,
      created_at: Date.now(),
    });

    // 42. PURCHASES
    const purchaseId = await ctx.db.insert("purchases", {
      establishment_id: establishmentId,
      supplier_id: supplierId,
      staff_id: staffId,
      purchase_date: Date.now(),
      subtotal: 10000,
      tax_amount: 2100,
      total_amount: 12100,
      status: "received",
      created_at: Date.now(),
    });

    // 43. PURCHASE ITEMS
    await ctx.db.insert("purchase_items", {
      purchase_id: purchaseId,
      ingredient_id: ingredientId,
      quantity: 20,
      unit_price: 500,
      total_price: 10000,
    });

    // 44. PROFIT ANALYSIS
    await ctx.db.insert("profit_analysis", {
      establishment_id: establishmentId,
      date: Date.now(),
      monthly_revenue: 3750000,
      staff_costs: 1200000,
      product_costs: 900000,
      daily_orders_avg: 100,
      created_at: Date.now(),
    });

    // 45. SYSTEM CONFIGS
    await ctx.db.insert("system_configs", {
      key: "default_currency",
      value: "EUR",
      description: "Moneda por defecto del sistema",
      type: "global",
    });

    // 46. STOCK MOVEMENTS
    await ctx.db.insert("stock_movements", {
      ingredient_id: ingredientId,
      establishment_id: establishmentId,
      type: "purchase",
      quantity: 20,
      unit_cost: 500,
      total_cost: 10000,
      supplier: "Carnes Premium S.L.",
      staff_id: staffId,
      timestamp: Date.now(),
    });

    // 47. COMPANY PROFIT ANALYSIS
    await ctx.db.insert("company_profit_analysis", {
      company_id: companyId,
      establishment_id: establishmentId,
      analysis_date: Date.now(),
      period_type: "monthly",
      total_revenue: 3750000,
      orders_count: 3000,
      average_ticket: 1250,
      staff_costs: 1200000,
      product_costs: 900000,
      operating_costs: 500000,
      platform_fees: 75000,
      gross_profit: 2850000,
      net_profit: 1075000,
      profit_margin: 28.67,
      created_at: Date.now(),
    });

    // 48. ESTABLISHMENT STATISTICS
    await ctx.db.insert("establishment_statistics", {
      company_id: companyId,
      establishment_id: establishmentId,
      stat_date: Date.now(),
      stat_type: "sales",
      data: { total_sales: 3750000, orders: 3000 },
      processed_at: Date.now(),
    });

    // 49. PERFORMANCE KPIS
    await ctx.db.insert("performance_kpis", {
      company_id: companyId,
      establishment_id: establishmentId,
      kpi_type: "revenue_per_employee",
      value: 375000,
      period: "2026-04",
      trend: "improving",
      created_at: Date.now(),
    });

    // 50. QR SESSIONS
    await ctx.db.insert("qr_sessions", {
      company_id: companyId,
      establishment_id: establishmentId,
      table_id: tableId,
      session_code: "QR-001",
      status: "closed",
      start_time: Date.now() - 3600000,
      end_time: Date.now(),
      customer_count: 2,
      interaction_count: 5,
      order_count: 1,
      total_amount: 1250,
      device_type: "mobile",
      platform: "whatsapp",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return {
      success: true,
      establishmentId,
      productId,
    };
  },
});

/**
 * Seed mínimo para el POS - Solo tablas del schema.ts actual
 */
export const seedPosData = mutation({
  args: {},
  handler: async (ctx) => {
    // 0. CREAR SUBSCRIPTION PLAN
    const planId = await ctx.db.insert("subscription_plans", {
      name: "Pro Plan",
      description: "Plan profesional para restaurantes",
      price: 9900, // 99.00€ en cents
      billing_cycle: "monthly",
      max_users: 10,
      max_establishments: 3,
      active: true,
      created_at: Date.now(),
    });

    // 1. CREAR COMPAÑÍA (requerida por el schema multi-tenant)
    const companyId = await ctx.db.insert("companies", {
      name: "Camarai Group S.L.",
      legal_name: "Camarai Group S.L.",
      nif: "B12345678",
      email: "admin@camarai.es",
      country: "España",
      plan_id: planId,
      plan_start_date: Date.now(),
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // 1. ESTABLECIMIENTO
    const establishmentId = await ctx.db.insert("establishments", {
      company_id: companyId,
      name: "Camarai Gastrobar",
      legal_name: "Camarai Restauración S.L.",
      cif: "B12345678",
      owner_id: "user_owner_01",
      plan: "pro",
      currency: "EUR",
      timezone: "Europe/Madrid",
      status: "active",
      phone: "+34 900 000 000",
      email: "gerencia@camarai.es",
      address: "Calle Gran Vía 1",
      city: "Madrid",
      province: "Madrid",
      postal_code: "28001",
      country: "España",
      created_at: Date.now(),
    });

    // 2. IMPUESTOS
    const taxId = await ctx.db.insert("taxes", {
      establishment_id: establishmentId,
      name: "IVA 10%",
      percentage: 10,
      is_default: true,
      created_at: Date.now(),
    });

    // 3. STAFF
    void await ctx.db.insert("staff", {
      establishment_id: establishmentId,
      name: "Miguel",
      last_name: "Riu",
      role: "admin",
      status: "active",
      contract_type: "indefinite",
      contract_start: Date.now(),
      salary: 4500000, // Céntimos
      irpf: 15,
      dashboard_sections: ["sales", "inventory", "marketing"],
      clock_methods: ["qr", "app"],
      created_at: Date.now(),
    });

    // 4. CATEGORÍAS
    const categories = [
      { name: "Entrantes", order: 1, color: "#1f8c9b" },
      { name: "Principal", order: 2, color: "#3b82f6" },
      { name: "Postres", order: 3, color: "#ec4899" },
      { name: "Bebidas", order: 4, color: "#e11d48" },
    ];

    const categoryIds = await Promise.all(
      categories.map((cat) =>
        ctx.db.insert("categories", {
          establishment_id: establishmentId,
          name: cat.name,
          order: cat.order,
          color: cat.color,
          active: true,
          visibleInMenu: true,
          created_at: Date.now(),
        })
      )
    );

    // 5. PRODUCTOS
    const products = [
      // --- ENTRANTES (categoryIndex: 0) ---
      { name: "Alitas de Búfalo", price: 12.99, categoryIndex: 0, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80" },
      { name: "Papas Fritas XL", price: 5.99, categoryIndex: 0, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80" },
      { name: "Nachos con Queso", price: 9.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80" },
      { name: "Guacamole Casero", price: 7.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80" },
      { name: "Croquetas de Jamón", price: 8.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80" },
      { name: "Tequeños de Queso", price: 7.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80" },
      { name: "Empanadas Argentinas", price: 6.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&q=80" },
      { name: "Aros de Cebolla", price: 5.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80" },
      { name: "Bruschetta de Tomate", price: 6.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?w=800&q=80" },
      { name: "Palitos de Mozzarella", price: 8.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1531749968967-ca0a243a728b?w=800&q=80" },
      { name: "Hummus con Pita", price: 6.90, categoryIndex: 0, image: "https://images.unsplash.com/photo-1577906030558-841f87fc127c?w=800&q=80" },
      { name: "Calamares a la Romana", price: 11.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
      { name: "Carpaccio de Ternera", price: 13.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" },
      { name: "Gazpacho", price: 5.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1594756297462-d596a3930730?w=800&q=80" },
      { name: "Gambas al Ajillo", price: 14.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&q=80" },
      { name: "Pan de Ajo con Queso", price: 4.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80" },
      { name: "Patatas Bravas", price: 6.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&q=80" },
      { name: "Provolone Fundido", price: 9.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800&q=80" },
      { name: "Spring Rolls", price: 7.20, categoryIndex: 0, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" },
      { name: "Ensalada Rusa", price: 7.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80" },
      { name: "Sopa de Cebolla", price: 6.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" },
      { name: "Gyozas de Pollo", price: 8.90, categoryIndex: 0, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80" },
      { name: "Tacos de Cochinita", price: 9.50, categoryIndex: 0, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80" },
      { name: "Edamame con Sal", price: 5.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1528751011213-906f3630f576?w=800&q=80" },
      { name: "Falafel (4 uds)", price: 6.00, categoryIndex: 0, image: "https://images.unsplash.com/photo-1547050359-c900c14896b2?w=800&q=80" },

      // --- PRINCIPAL (categoryIndex: 1) ---
      { name: "Burger Camarai", price: 14.50, categoryIndex: 1, variants: { "medio": 14.50, "grande": 17.50 }, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
      { name: "Costillar BBQ", price: 18.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" },
      { name: "Solomillo al Whisky", price: 22.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800&q=80" },
      { name: "Lasaña de Carne", price: 13.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80" },
      { name: "Salmón Grillado", price: 17.90, categoryIndex: 1, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80" },
      { name: "Pasta Carbonara", price: 12.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80" },
      { name: "Entrecot de Ternera", price: 21.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&q=80" },
      { name: "Pollo al Curry", price: 14.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80" },
      { name: "Risotto de Setas", price: 15.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80" },
      { name: "Lubina a la Espalda", price: 19.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&q=80" },
      { name: "Pizza Margarita", price: 11.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=800&q=80" },
      { name: "Pizza Pepperoni", price: 12.90, categoryIndex: 1, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80" },
      { name: "Paella de Marisco", price: 18.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?w=800&q=80" },
      { name: "Burger Vegana", price: 13.90, categoryIndex: 1, image: "https://images.unsplash.com/photo-1584947847799-ed30263f338c?w=800&q=80" },
      { name: "Codillo Asado", price: 16.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1594973474495-263a233400a4?w=800&q=80" },
      { name: "Espaguetis Bolonesa", price: 11.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=800&q=80" },
      { name: "Filete de Merluza", price: 15.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" },
      { name: "Entraña a la Parrilla", price: 19.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80" },
      { name: "Raviolis de Espinaca", price: 12.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80" },
      { name: "Pollo Asado", price: 13.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80" },
      { name: "Pechuga Empanada", price: 12.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1569058242253-92a9c71f9867?w=800&q=80" },
      { name: "Cordero Lechal", price: 25.00, categoryIndex: 1, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80" },
      { name: "Tataki de Atún", price: 18.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1501595091296-3ca970fd0597?w=800&q=80" },
      { name: "Bowl de Poke Salmón", price: 14.90, categoryIndex: 1, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" },
      { name: "Pad Thai Pollo", price: 13.50, categoryIndex: 1, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" },

      // --- POSTRES (categoryIndex: 2) ---
      { name: "Tarta de Queso", price: 6.90, categoryIndex: 2, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80" },
      { name: "Brownie con Helado", price: 7.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800&q=80" },
      { name: "Tiramisú", price: 6.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80" },
      { name: "Coulant de Chocolate", price: 7.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80" },
      { name: "Arroz con Leche", price: 5.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1543508282-5c1f427f023f?w=800&q=80" },
      { name: "Flan de Huevo", price: 4.90, categoryIndex: 2, image: "https://images.unsplash.com/photo-1528452219415-b20c784969e7?w=800&q=80" },
      { name: "Natillas", price: 4.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1511914265872-c40672604a80?w=800&q=80" },
      { name: "Tarta de Manzana", price: 6.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&q=80" },
      { name: "Sorbetes Variados", price: 5.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1505394033343-431d1b6623bc?w=800&q=80" },
      { name: "Fruta de Temporada", price: 4.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80" },
      { name: "Mousse de Chocolate", price: 5.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=800&q=80" },
      { name: "Panacota con Moras", price: 6.20, categoryIndex: 2, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
      { name: "Cheesecake de Oreo", price: 7.20, categoryIndex: 2, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80" },
      { name: "Crepe con Nutella", price: 6.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80" },
      { name: "Waffle con Caramelo", price: 6.80, categoryIndex: 2, image: "https://images.unsplash.com/photo-1541830826427-e160124bc7ad?w=800&q=80" },
      { name: "Tarta Red Velvet", price: 7.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&q=80" },
      { name: "Helado 3 Bolas", price: 5.80, categoryIndex: 2, image: "https://images.unsplash.com/photo-1560008511-11c63416e52d?w=800&q=80" },
      { name: "Milhojas", price: 6.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&q=80" },
      { name: "Tarta de Limón", price: 6.40, categoryIndex: 2, image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&q=80" },
      { name: "Profiteroles", price: 6.20, categoryIndex: 2, image: "https://images.unsplash.com/photo-1558961312-50345c075bc5?w=800&q=80" },
      { name: "Donas Gourmet", price: 4.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80" },
      { name: "Pastel de Zanahoria", price: 6.90, categoryIndex: 2, image: "https://images.unsplash.com/photo-1535141123063-3bb6cdc5f57b?w=800&q=80" },
      { name: "Torrijas", price: 5.50, categoryIndex: 2, image: "https://images.unsplash.com/photo-1511914265872-c40672604a80?w=800&q=80" },
      { name: "Plátano Flameado", price: 7.00, categoryIndex: 2, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80" },
      { name: "Sándwich Helado", price: 5.20, categoryIndex: 2, image: "https://images.unsplash.com/photo-1558448834-080c95029304?w=800&q=80" },

      // --- BEBIDAS (categoryIndex: 3) ---
      { name: "Cerveza Artesanal", price: 4.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800&q=80" },
      { name: "Coca Cola 350ml", price: 2.80, categoryIndex: 3, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80" },
      { name: "Agua Mineral", price: 2.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80" },
      { name: "Limonada Natural", price: 3.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1523677012304-5c7da45ad675?w=800&q=80" },
      { name: "Vino Tinto Copa", price: 4.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80" },
      { name: "Zumo Naranja", price: 3.20, categoryIndex: 3, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80" },
      { name: "Té Helado", price: 3.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80" },
      { name: "Café Expreso", price: 1.80, categoryIndex: 3, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80" },
      { name: "Capuchino", price: 2.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80" },
      { name: "Batido de Fresa", price: 4.90, categoryIndex: 3, image: "https://images.unsplash.com/photo-1543648964-122c67ed7bc9?w=800&q=80" },
      { name: "Mojito Clásico", price: 7.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
      { name: "Agua con Gas", price: 2.20, categoryIndex: 3, image: "https://images.unsplash.com/photo-1559839914-17aae19cea9e?w=800&q=80" },
      { name: "Copa Gin Tonic", price: 8.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&q=80" },
      { name: "Tinto de Verano", price: 4.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1555658636-6e4a36218be7?w=800&q=80" },
      { name: "Smoothie Mango", price: 5.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80" },
      { name: "Cerveza 0,0%", price: 3.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=800&q=80" },
      { name: "Margarita", price: 7.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1536935338218-d2139b9c3db2?w=800&q=80" },
      { name: "Sangría Jarra", price: 15.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80" },
      { name: "Vino Blanco Copa", price: 4.20, categoryIndex: 3, image: "https://images.unsplash.com/photo-1474721336077-3bc01607d77b?w=800&q=80" },
      { name: "Negroni", price: 8.00, categoryIndex: 3, image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=800&q=80" },
      { name: "Caipirinha", price: 7.80, categoryIndex: 3, image: "https://images.unsplash.com/photo-1510156906263-44f2d72120bc?w=800&q=80" },
      { name: "Piña Colada", price: 7.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=80" },
      { name: "Frappé de Café", price: 4.80, categoryIndex: 3, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80" },
      { name: "Kombucha Fresa", price: 4.20, categoryIndex: 3, image: "https://images.unsplash.com/photo-1558532474-06109968430e?w=800&q=80" },
      { name: "Chocolate Caliente", price: 3.50, categoryIndex: 3, image: "https://images.unsplash.com/photo-1544787210-2211d44b5057?w=800&q=80" },
    ];

    const productIds = await Promise.all(
      products.map((prod: { name: string; price: number; categoryIndex: number; image?: string; variants?: Record<string, number> }, idx) =>
        ctx.db.insert("products", {
          establishment_id: establishmentId,
          category_id: categoryIds[prod.categoryIndex],
          name: prod.name,
          price: prod.price,
          cost: Math.floor(prod.price * 0.3),
          tax_id: taxId,
          active: true,
          is_elaborated: true,
          allergens: [],
          preparation_time: 15,
          available_pos: true,
          available_delivery: false,
          stock_minimo: 10,
          impresora_destino: "cocina",
          order: idx,
          variants: prod.variants || undefined,
          image: prod.image || undefined,
          created_at: Date.now(),
        })
      )
    );

    // 6. AMBIENTES Y MESAS
    const envSalon = await ctx.db.insert("environments", {
      establishment_id: establishmentId,
      name: "Salón",
      capacity: 40,
      status: "active",
      order: 1,
      created_at: Date.now(),
    });

    const envBarra = await ctx.db.insert("environments", {
      establishment_id: establishmentId,
      name: "Barra",
      capacity: 10,
      status: "active",
      order: 2,
      created_at: Date.now(),
    });

    // Mesas Salón
    for (let i = 1; i <= 10; i++) {
      await ctx.db.insert("tables", {
        environment_id: envSalon,
        number: i,
        capacity: i % 3 === 0 ? 6 : 4,
        status: "free",
        x: 50 + (i % 5) * 120,
        y: 50 + Math.floor(i / 5) * 120,
        width: 80,
        height: 80,
        rotation: 0,
        shape: i % 2 === 0 ? "square" : "rectangle",
      });
    }

    // Mesas Barra
    for (let i = 1; i <= 6; i++) {
      await ctx.db.insert("tables", {
        environment_id: envBarra,
        number: i,
        capacity: 2,
        status: "free",
        x: 50 + i * 60,
        y: 50,
        width: 50,
        height: 50,
        rotation: 0,
        shape: "circle",
      });
    }

    // 7. CLIENTE
    void await ctx.db.insert("customers", {
      establishments_id: [establishmentId],
      name: "Cliente Demo",
      phone: "+34 600 000 000",
      created_at: Date.now(),
      points: 0,
      total_visits: 0,
      total_spent: 0,
      average_ticket: 0,
      source: "manual",
      allergens: [],
    });

    return {
      success: true,
      establishmentId,
      categories: categoryIds,
      products: productIds,
    };
  },
});
