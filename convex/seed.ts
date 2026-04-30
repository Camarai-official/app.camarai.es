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

    await ctx.db.insert("user_roles", {
      user_id: "user_owner_01",
      company_id: companyId,
      establishment_id: establishmentId,
      role_id: adminRoleId,
      status: "active",
      assigned_by: "system",
      assigned_at: Date.now(),
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
      end_time: "22:00",
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
