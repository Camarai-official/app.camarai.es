import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- DOMAIN 0: MULTI-TENANT ENTERPRISE LAYER ---

  companies: defineTable({
    name: v.string(),
    legal_name: v.optional(v.string()),
    nif: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    country: v.string(),
    logo_url: v.optional(v.string()),
    website: v.optional(v.string()),
    plan_id: v.id("subscription_plans"),
    plan_start_date: v.number(),
    plan_end_date: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("suspended"), v.literal("cancelled")),
    configuration: v.optional(v.any()), // JSON config
    created_at: v.number(),
    updated_at: v.number(),
  }),

  subscription_plans: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // In cents
    billing_cycle: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annual")),
    max_users: v.number(),
    max_establishments: v.number(),
    features: v.optional(v.any()), // JSON features
    active: v.boolean(),
    created_at: v.number(),
  }),

  // --- DOMAIN 1: ORGANIZATIONAL CORE ---

  establishments: defineTable({
    company_id: v.id("companies"),
    name: v.string(),
    legal_name: v.optional(v.string()), // Razón Social / Legal Name
    cif: v.string(),
    owner_id: v.string(), // Clerk/External Auth ID
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
    currency: v.string(),
    timezone: v.string(),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("suspended")),
    phone: v.optional(v.string()),
    email: v.string(),
    address: v.optional(v.string()),
    city: v.string(),
    province: v.optional(v.string()),
    postal_code: v.string(),
    country: v.string(),
    logo_url: v.optional(v.string()),
    website: v.optional(v.string()),
    whatsapp_number: v.optional(v.string()),
    receipt_footer: v.optional(v.string()),
    operating_hours: v.optional(v.any()), // Structured schedule
    api_keys: v.optional(v.object({
      square_id: v.optional(v.string()),
      stripe_public: v.optional(v.string()),
      evolution_api_key: v.optional(v.string()),
    })),
    created_at: v.number(),
  }).index("by_company", ["company_id"]),

  staff: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    last_name: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("cook"),
      v.literal("bartender"),
      v.literal("host")
    ),
    pin: v.optional(v.string()), // Hashed PIN for POS
    auth_id: v.optional(v.string()), // External Auth ID
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    photo_url: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("on_leave"), v.literal("sick_leave")),
    contract_type: v.union(v.literal("indefinite"), v.literal("temporary"), v.literal("practices"), v.literal("freelance")),
    contract_start: v.number(),
    contract_end: v.optional(v.number()),
    salary: v.number(), // In cents
    hourly_rate: v.optional(v.number()), // In cents
    contracted_hours: v.optional(v.number()),
    iban: v.optional(v.string()),
    irpf: v.number(),
    ss_number: v.optional(v.string()),
    break_duration_minutes: v.optional(v.number()), // From SQL
    max_late_minutes: v.optional(v.number()), // From SQL
    dashboard_sections: v.array(v.string()),
    clock_methods: v.array(v.string()),
    documents: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    departamento: v.optional(v.string()), // Departamento o área de trabajo
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  // --- DOMAIN 1.5: ROLES AND PERMISSIONS SYSTEM ---

  roles: defineTable({
    company_id: v.id("companies"),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()), // Array of permission slugs
    is_system: v.boolean(), // System roles vs custom roles
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_company", ["company_id"]),

  permissions: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    module: v.string(), // 'orders', 'staff', 'inventory', etc.
    created_at: v.number(),
  }).index("by_module", ["module"]),

  user_roles: defineTable({
    user_id: v.string(), // External auth ID
    company_id: v.id("companies"),
    establishment_id: v.optional(v.id("establishments")), // For establishment-specific roles
    role_id: v.id("roles"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
    assigned_by: v.string(), // Who assigned this role
    assigned_at: v.number(),
  }).index("by_user", ["user_id"])
    .index("by_company", ["company_id"])
    .index("by_establishment", ["establishment_id"]),

  // --- DOMAIN 2: ORGANIZATIONAL CORE (continued) ---

  subscriptions: defineTable({
    establishment_id: v.id("establishments"),
    plan: v.string(),
    monthly_fee: v.number(),
    commission_per_order: v.number(),
    status: v.string(),
    billing_cycle: v.string(),
    next_billing_date: v.number(),
    stripe_subscription_id: v.optional(v.string()),
    stripe_customer_id: v.optional(v.string()),
    total_commissions_pending: v.number(),
    last_invoice_date: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  notification_settings: defineTable({
    establishment_id: v.id("establishments"),
    stock_alerts: v.boolean(),
    stock_alert_channel: v.string(),
    reservation_alerts: v.boolean(),
    reservation_reminder_hours: v.number(),
    clock_incident_alerts: v.boolean(),
    order_cancellation_alerts: v.boolean(),
    daily_summary: v.boolean(),
    admin_email: v.optional(v.string()),
    admin_whatsapp: v.optional(v.string()),
  }).index("by_establishment", ["establishment_id"]),

  // --- DOMAIN 2: CATALOG AND MULTILINGUAL ---

  categories: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    translations: v.optional(v.record(v.string(), v.string())), // { "en": "Starters", "es": "Entrantes" }
    description: v.optional(v.string()),
    order: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    active: v.boolean(),
    printerDestination: v.optional(v.string()),
    visibleInMenu: v.boolean(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  products: defineTable({
    establishment_id: v.id("establishments"),
    category_id: v.id("categories"),
    name: v.string(),
    translations: v.optional(v.record(v.string(), v.string())), 
    description: v.optional(v.string()),
    price: v.number(), // In cents
    cost: v.number(), // In cents
    image: v.optional(v.string()),
    sku: v.optional(v.string()),
    model: v.optional(v.string()),
    brand: v.optional(v.string()),
    is_elaborated: v.boolean(), // Elaborado en casa
    active: v.boolean(),
    tax_id: v.id("taxes"),
    allergens: v.array(v.string()),
    variants: v.optional(v.any()), 
    preparation_time: v.number(), // In minutes
    available_pos: v.boolean(),
    available_delivery: v.boolean(),
    availability_hours: v.optional(v.union(
      v.object({ start: v.string(), end: v.string() }),
      v.null()
    )),
    stock_minimo: v.number(),
    impresora_destino: v.string(),
    order: v.number(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"])
    .index("by_category", ["category_id"]),

  product_ingredients: defineTable({ // Recipes
    product_id: v.id("products"),
    ingredient_id: v.id("ingredients"),
    quantity_required: v.number(),
    unit: v.string(),
  }).index("by_product", ["product_id"]),

  ingredients: defineTable({
    establishment_id: v.id("establishments"),
    category_id: v.id("ingredient_categories"),
    name: v.string(),
    stock: v.number(),
    alert_min: v.number(),
    stock_max: v.optional(v.number()),
    unit: v.union(v.literal("kg"), v.literal("units"), v.literal("liters"), v.literal("grams")),
    cost_base: v.number(),
    supplier: v.optional(v.string()),
    barcode: v.optional(v.string()),
    conversions: v.optional(v.any()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  ingredient_categories: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    order: v.number(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  taxes: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    percentage: v.number(),
    is_default: v.boolean(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  menu: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("standard"), v.literal("combo"), v.literal("daily"), v.literal("tasting"), v.literal("carta")),
    active: v.boolean(),
    price: v.optional(v.number()),
    product_ids: v.array(v.id("products")),
    available_days: v.array(v.string()),
    published_at: v.optional(v.number()),
    // UI Configuration
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.number(),
    // WhatsApp Configuration for carta type
    whatsapp_enabled: v.optional(v.boolean()),
    whatsapp_voice_enabled: v.optional(v.boolean()),
    whatsapp_welcome_message: v.optional(v.string()),
    whatsapp_schedule_start: v.optional(v.string()), // "HH:mm"
    whatsapp_schedule_end: v.optional(v.string()), // "HH:mm"
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_establishment", ["establishment_id"])
    .index("by_establishment_active", ["establishment_id", "active"])
    .index("by_establishment_type", ["establishment_id", "type"]),
  
  menu_sections: defineTable({
    menu_id: v.id("menu"),
    element_type: v.union(v.literal("category"), v.literal("product"), v.literal("menu")),
    element_id: v.string(), // ID of the referenced element
    display_order: v.number(),
    created_at: v.number(),
  }).index("by_menu", ["menu_id"]),

  // --- DOMAIN 3: SALES OPERATIONS & FINANCES ---

  environments: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("maintenance")),
    order: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  tables: defineTable({
    environment_id: v.id("environments"),
    number: v.number(),
    label: v.optional(v.string()),
    capacity: v.number(),
    status: v.union(v.literal("free"), v.literal("occupied"), v.literal("reserved"), v.literal("dirty")),
    current_order_id: v.optional(v.id("orders")),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    rotation: v.number(),
    shape: v.union(v.literal("rectangle"), v.literal("circle"), v.literal("square")),
    chairs: v.optional(v.any()), // Visual chair configuration
    is_object: v.optional(v.boolean()), // Decoration objects/walls
    object_type: v.optional(v.string()),
  }).index("by_environment", ["environment_id"]),

  orders: defineTable({
    establishment_id: v.id("establishments"),
    table_id: v.optional(v.id("tables")),
    staff_id: v.id("staff"),
    customer_id: v.optional(v.id("customers")),
    order_number: v.string(),
    status: v.union(v.literal("open"), v.literal("paid"), v.literal("cancelled"), v.literal("refunded")),
    total_amount: v.number(), // In cents
    subtotal: v.number(), // In cents
    tax_amount: v.number(), // In cents
    discount_amount: v.number(), // In cents
    discount_reason: v.optional(v.string()),
    notes: v.optional(v.string()),
    payment_type: v.union(v.literal("individual"), v.literal("shared"), v.literal("split")),
    source: v.union(v.literal("pos"), v.literal("pda"), v.literal("carta"), v.literal("voice"), v.literal("agent")),
    guests: v.number(),
    is_commission_order: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
    closed_at: v.optional(v.number()),
    // Delivery & WhatsApp fields from struct_dump.sql
    delivery_address: v.optional(v.string()),
    delivery_postal_code: v.optional(v.string()),
    delivery_city: v.optional(v.string()),
    delivery_phone: v.optional(v.string()),
    tracking_code: v.optional(v.string()),
    origen_whatsapp: v.optional(v.boolean()),
    metodo_pago: v.optional(v.string()), // effective, card, etc.
  }).index("by_establishment", ["establishment_id"])
    .index("by_establishment_status", ["establishment_id", "status"])
    .index("by_establishment_created", ["establishment_id", "created_at"]),

  order_items: defineTable({
    order_id: v.id("orders"),
    product_id: v.id("products"),
    product_name: v.string(),
    quantity: v.number(),
    unit_price: v.number(),
    total_price: v.number(),
    variant: v.optional(v.string()),
    notes: v.optional(v.string()),
    course: v.union(v.literal("first"), v.literal("second"), v.literal("dessert"), v.literal("drink")),
    item_status: v.union(v.literal("pending"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("cancelled")),
    sent_to_kitchen_at: v.optional(v.number()),
    ready_at: v.optional(v.number()),
    // Individual item payment from struct_dump.sql
    client_id: v.optional(v.id("customers")),
    payment_status: v.optional(v.union(v.literal("pending"), v.literal("paid"))),
    payment_method: v.optional(v.string()),
    paid_at: v.optional(v.number()),
  }).index("by_order", ["order_id"]),

  payments: defineTable({
    establishment_id: v.id("establishments"),
    order_id: v.id("orders"),
    method: v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"), v.literal("transfer")),
    amount: v.number(),
    tip: v.number(),
    reference: v.optional(v.string()),
    staff_id: v.id("staff"),
    timestamp: v.number(),
  }).index("by_order", ["order_id"])
    .index("by_establishment_timestamp", ["establishment_id", "timestamp"]),

  cash_registers: defineTable({ // Arqueos de Caja
    establishment_id: v.id("establishments"),
    staff_id: v.id("staff"),
    status: v.union(v.literal("open"), v.literal("closed")),
    opening_time: v.number(),
    closing_time: v.optional(v.number()),
    initial_balance: v.number(),
    cash_sales: v.number(),
    card_sales: v.number(),
    withdrawals: v.number(),
    final_balance_real: v.optional(v.number()),
    difference: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_establishment", ["establishment_id"]),

  invoices: defineTable({ // Facturación Legal
    establishment_id: v.id("establishments"),
    order_id: v.id("orders"),
    customer_id: v.optional(v.id("customers")),
    number: v.string(),
    series: v.string(),
    type: v.union(v.literal("simplified"), v.literal("full"), v.literal("rectificative")),
    status: v.union(v.literal("issued"), v.literal("paid"), v.literal("annulled")),
    total_amount: v.number(),
    pdf_url: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  reservations: defineTable({
    establishment_id: v.id("establishments"),
    customer_id: v.id("customers"),
    table_id: v.optional(v.id("tables")),
    customer_name: v.optional(v.string()), // For guest reservations
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    date: v.string(), // ISO "YYYY-MM-DD"
    time: v.string(), // "HH:mm"
    guests: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed"), v.literal("no_show")),
    notified: v.boolean(),
    source: v.union(v.literal("dashboard"), v.literal("whatsapp"), v.literal("web")),
    notes: v.optional(v.string()),
    reminder_sent: v.boolean(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  customers: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    points: v.number(),
    tags: v.optional(v.array(v.string())), // Segment tags
    preferred_payment_method: v.optional(v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"))),
    birth_date: v.optional(v.string()),
    anniversary: v.optional(v.string()),
    last_visit: v.optional(v.number()),
    total_visits: v.number(),
    total_spent: v.number(),
    average_ticket: v.number(),
    preferred_table: v.optional(v.id("tables")),
    allergens: v.array(v.string()),
    notes: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("whatsapp"), v.literal("reservation")),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  // --- DOMAIN 4: HR AND ATTENDANCE ---

  time_logs: defineTable({
    establishment_id: v.id("establishments"),
    staff_id: v.id("staff"),
    action: v.union(v.literal("clock_in"), v.literal("clock_out"), v.literal("break_start"), v.literal("break_end")),
    timestamp: v.number(),
    method: v.union(v.literal("app"), v.literal("whatsapp"), v.literal("qr"), v.literal("web"), v.literal("manual")),
    device_id: v.optional(v.id("clock_devices")),
    location: v.optional(v.string()),
    modified_by: v.optional(v.id("staff")),
    notes: v.optional(v.string()),
  }).index("by_staff_timestamp", ["staff_id", "timestamp"]),

  shifts: defineTable({ 
    establishment_id: v.id("establishments"),
    name: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    days_of_week: v.array(v.string()),
    staff_ids: v.array(v.id("staff")),
    active: v.boolean(),
  }).index("by_establishment", ["establishment_id"]),

  absence_requests: defineTable({
    staff_id: v.id("staff"),
    establishment_id: v.id("establishments"),
    type: v.union(v.literal("vacation"), v.literal("sick_leave"), v.literal("personal_days"), v.literal("other")),
    start_date: v.string(),
    end_date: v.string(),
    total_days: v.number(),
    reason: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewed_by: v.optional(v.id("staff")),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  clock_incidents: defineTable({
    staff_id: v.id("staff"),
    establishment_id: v.id("establishments"),
    type: v.union(v.literal("no_clock_out"), v.literal("duplicate"), v.literal("late_clock_in"), v.literal("suspicious")),
    description: v.string(),
    status: v.union(v.literal("open"), v.literal("justified"), v.literal("rejected")),
    detected_at: v.number(),
    resolved_by: v.optional(v.id("staff")),
    resolved_at: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_establishment", ["establishment_id"]),

  clock_devices: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    type: v.union(v.literal("tablet"), v.literal("terminal"), v.literal("smartphone")),
    location: v.optional(v.string()),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance")),
    token: v.string(),
    last_seen: v.optional(v.number()),
    intervalo_qr: v.optional(v.number()), // QR refresh interval in seconds
    modo_offline: v.optional(v.boolean()), // Offline mode capability
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  establishment_settings: defineTable({
    establishment_id: v.id("establishments"),
    clock_methods: v.array(v.string()),
    auto_incident_detection: v.boolean(),
    max_late_minutes: v.number(),
    break_duration_minutes: v.number(),
    workday_start: v.optional(v.string()), // "HH:mm"
    workday_end: v.optional(v.string()), // "HH:mm"
    overtime_alert: v.boolean(),
  }).index("by_establishment", ["establishment_id"]),

  // --- DOMAIN 5: AUDIT AND INFRASTRUCTURE ---

  event_log: defineTable({
    establishment_id: v.id("establishments"),
    type: v.union(v.literal("security"), v.literal("inventory"), v.literal("operational"), v.literal("financial")),
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    actor: v.union(v.id("staff"), v.literal("system")), // Improved typing
    action: v.string(),
    entity_type: v.string(),
    entity_id: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    timestamp: v.number(),
    ip_address: v.optional(v.string()),
  }).index("by_establishment", ["establishment_id"])
    .index("by_establishment_timestamp", ["establishment_id", "timestamp"]),

  // --- DOMAIN 5.5: ADVANCED AUDIT AND COMPLIANCE ---

  audit_log: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.optional(v.id("establishments")),
    user_id: v.string(), // External auth ID
    action: v.string(), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
    table_name: v.string(),
    record_id: v.string(),
    old_values: v.optional(v.any()),
    new_values: v.optional(v.any()),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    session_id: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_company", ["company_id"])
    .index("by_establishment", ["establishment_id"])
    .index("by_user", ["user_id"])
    .index("by_timestamp", ["timestamp"]),

  payment_audit: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.id("establishments"),
    order_id: v.id("orders"),
    payment_type: v.union(v.literal("individual"), v.literal("shared"), v.literal("split")),
    old_type: v.optional(v.union(v.literal("individual"), v.literal("shared"), v.literal("split"))),
    new_type: v.optional(v.union(v.literal("individual"), v.literal("shared"), v.literal("split"))),
    user_id: v.string(), // Who made the change
    reason: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_order", ["order_id"])
    .index("by_company", ["company_id"]),

  // --- DOMAIN 6: INFRASTRUCTURE AND INTEGRATIONS ---

  devices: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    type: v.union(v.literal("pos_terminal"), v.literal("printer"), v.literal("kds_station")),
    connection: v.union(v.literal("usb"), v.literal("wifi"), v.literal("bluetooth")),
    ip_address: v.optional(v.string()),
    role: v.union(v.literal("main"), v.literal("kitchen"), v.literal("bar")),
    status: v.union(v.literal("online"), v.literal("offline")),
    last_seen: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  whatsapp_config: defineTable({
    establishment_id: v.id("establishments"),
    instance_name: v.string(),
    api_url: v.string(),
    api_key: v.string(),
    phone: v.string(),
    status: v.union(v.literal("connected"), v.literal("disconnected"), v.literal("qr_pending"), v.literal("error_conexion")),
    last_sync: v.optional(v.number()),
    active: v.boolean(),
  }).index("by_establishment", ["establishment_id"]),

  integrations: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.id("establishments"),
    type: v.union(
      v.literal("uber_eats"),
      v.literal("glovo"), 
      v.literal("just_eat"),
      v.literal("deliveroo"),
      v.literal("tpv"),
      v.literal("contabilidad"),
      v.literal("analytics"),
      v.literal("otro")
    ),
    name: v.string(),
    config: v.optional(v.any()), // API keys, webhooks, etc.
    webhook_url: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("error"), v.literal("pending")),
    last_sync: v.optional(v.number()),
    sync_frequency: v.optional(v.number()), // Minutes between syncs
    error_log: v.optional(v.array(v.string())),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_company", ["company_id"])
    .index("by_establishment", ["establishment_id"])
    .index("by_type", ["type"]),

  integration_orders: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.id("establishments"),
    integration_id: v.id("integrations"),
    order_id: v.optional(v.id("orders")), // Internal order reference
    external_id: v.string(), // External platform order ID
    order_data: v.any(), // Full order data from external platform
    status: v.union(
      v.literal("recibido"),
      v.literal("aceptado"), 
      v.literal("rechazado"),
      v.literal("preparando"),
      v.literal("listo"),
      v.literal("entregado"),
      v.literal("cancelado")
    ),
    customer_data: v.optional(v.any()), // Customer info from platform
    delivery_data: v.optional(v.any()), // Delivery instructions
    platform_fee: v.optional(v.number()), // Platform commission
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_establishment", ["establishment_id"])
    .index("by_integration", ["integration_id"])
    .index("by_external_id", ["external_id"])
    .index("by_status", ["status"]),

  // --- DOMAIN 6: COMMUNICATION AND MARKETING ---

  conversations: defineTable({
    establishment_id: v.id("establishments"),
    channel_name: v.string(),
    channel_type: v.union(v.literal("general"), v.literal("environment"), v.literal("private")),
    participant_ids: v.array(v.string()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  messages: defineTable({
    conversation_id: v.id("conversations"),
    sender_id: v.id("staff"),
    content: v.string(),
    message_type: v.union(v.literal("text"), v.literal("system"), v.literal("agent_alert")),
    timestamp: v.number(),
  }).index("by_conversation_timestamp", ["conversation_id", "timestamp"]),

  campaigns: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    message_template: v.string(),
    audience_filter: v.optional(v.any()), // JSON of filters
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"), v.literal("cancelled")),
    scheduled_at: v.optional(v.number()),
    sent_at: v.optional(v.number()),
    stats: v.optional(v.object({
      sent_count: v.number(),
      delivered_count: v.number(),
      read_count: v.number(),
    })),
    created_at: v.number(),
  }).index("by_establishment_status", ["establishment_id", "status"]),

  coupons: defineTable({
    establishment_id: v.id("establishments"),
    code: v.string(),
    discount_type: v.union(v.literal("percentage"), v.literal("fixed_amount")),
    discount_value: v.number(),
    min_order_amount: v.optional(v.number()),
    usage_limit: v.optional(v.number()),
    used_count: v.number(),
    valid_from: v.number(),
    valid_until: v.number(),
    is_active: v.boolean(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  customer_tags: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    color: v.string(),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  table_sessions: defineTable({
    table_id: v.id("tables"),
    session_code: v.string(), // Código único para QR
    status: v.union(v.literal("active"), v.literal("closed")),
    start_time: v.number(),
    end_time: v.optional(v.number()),
    clients: v.optional(v.array(v.any())), // Info de clientes en la sesión
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_table_status", ["table_id", "status"])
    .index("by_code", ["session_code"]),

  verification_codes: defineTable({
    code: v.string(),
    phone_number: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("expired"), v.literal("finalizado")),
    expires_at: v.number(),
    created_at: v.number(),
  }).index("by_phone", ["phone_number"])
    .index("by_email", ["email"]),

  // --- DOMAIN 7: PROCUREMENT AND FINANCIAL INTELLIGENCE ---

  suppliers: defineTable({
    establishment_id: v.id("establishments"),
    name: v.string(),
    contact_person: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    nif: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  purchases: defineTable({
    establishment_id: v.id("establishments"),
    supplier_id: v.id("suppliers"),
    staff_id: v.optional(v.id("staff")),
    purchase_date: v.number(),
    invoice_number: v.optional(v.string()),
    subtotal: v.number(),
    tax_amount: v.number(),
    total_amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("received"), v.literal("cancelled")),
    notes: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  purchase_items: defineTable({
    purchase_id: v.id("purchases"),
    ingredient_id: v.id("ingredients"),
    quantity: v.number(),
    unit_price: v.number(),
    total_price: v.number(),
  }).index("by_purchase", ["purchase_id"]),

  profit_analysis: defineTable({
    establishment_id: v.id("establishments"),
    date: v.number(),
    monthly_revenue: v.number(),
    staff_costs: v.number(),
    product_costs: v.number(),
    daily_orders_avg: v.number(),
    table_rotation_before: v.optional(v.number()),
    table_rotation_after: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_establishment", ["establishment_id"]),

  notifications: defineTable({
    staff_id: v.id("staff"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
    read: v.boolean(),
    data: v.optional(v.any()),
    created_at: v.number(),
  }).index("by_staff", ["staff_id"])
    .index("by_staff_read", ["staff_id", "read"]),

  system_configs: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("global"), v.literal("establishment")),
    reference_id: v.optional(v.string()), // establishment_id or null
  }).index("by_key_type", ["key", "type"]),

  stock_movements: defineTable({
    ingredient_id: v.id("ingredients"),
    establishment_id: v.id("establishments"),
    type: v.union(v.literal("purchase"), v.literal("waste"), v.literal("adjustment"), v.literal("auto_deduction"), v.literal("sale"), v.literal("return")),
    quantity: v.number(),
    unit_cost: v.number(),
    total_cost: v.number(),
    supplier: v.optional(v.string()),
    notes: v.optional(v.string()),
    staff_id: v.optional(v.union(v.id("staff"), v.literal("system"))),
    timestamp: v.number(),
  }).index("by_ingredient_timestamp", ["ingredient_id", "timestamp"]),

  // --- DOMAIN 8: ADVANCED BUSINESS INTELLIGENCE ---

  company_profit_analysis: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.optional(v.id("establishments")),
    analysis_date: v.number(), // Unix timestamp for the date
    period_type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("quarterly"), v.literal("yearly")),
    
    // Revenue metrics
    total_revenue: v.number(),
    orders_count: v.number(),
    average_ticket: v.number(),
    
    // Cost breakdown
    staff_costs: v.number(),
    product_costs: v.number(),
    operating_costs: v.number(),
    platform_fees: v.number(),
    
    // Profit metrics
    gross_profit: v.number(),
    net_profit: v.number(),
    profit_margin: v.number(),
    
    // Operational metrics
    table_rotation_before: v.optional(v.number()),
    table_rotation_after: v.optional(v.number()),
    peak_hour_revenue: v.optional(v.number()),
    customer_return_rate: v.optional(v.number()),
    
    // Comparison metrics
    revenue_growth: v.optional(v.number()), // Percentage growth vs previous period
    profit_growth: v.optional(v.number()),
    efficiency_score: v.optional(v.number()), // 0-100 score
    
    // AI Insights
    ai_insights: v.optional(v.any()), // Generated insights and recommendations
    trend_predictions: v.optional(v.any()), // Predicted trends
    
    created_at: v.number(),
  }).index("by_company", ["company_id"])
    .index("by_establishment", ["establishment_id"])
    .index("by_date", ["analysis_date"])
    .index("by_period", ["period_type"]),

  establishment_statistics: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.id("establishments"),
    stat_date: v.number(),
    stat_type: v.union(
      v.literal("sales"),
      v.literal("products"),
      v.literal("customers"),
      v.literal("staff"),
      v.literal("inventory"),
      v.literal("delivery"),
      v.literal("profitability")
    ),
    data: v.any(), // Flexible JSON data for different stat types
    processed_at: v.number(),
  }).index("by_establishment_date", ["establishment_id", "stat_date"])
    .index("by_type", ["stat_type"])
    .index("by_company", ["company_id"]),

  performance_kpis: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.optional(v.id("establishments")),
    kpi_type: v.union(
      v.literal("revenue_per_employee"),
      v.literal("table_turnover"),
      v.literal("customer_satisfaction"),
      v.literal("inventory_turnover"),
      v.literal("labor_cost_percentage"),
      v.literal("food_cost_percentage"),
      v.literal("delivery_efficiency"),
      v.literal("online_order_percentage")
    ),
    value: v.number(),
    target: v.optional(v.number()),
    period: v.string(), // "2024-03", "Q1-2024", etc.
    benchmark: v.optional(v.number()), // Industry benchmark
    variance: v.optional(v.number()), // Difference from target
    trend: v.union(v.literal("improving"), v.literal("declining"), v.literal("stable")),
    created_at: v.number(),
  }).index("by_company", ["company_id"])
    .index("by_establishment", ["establishment_id"])
    .index("by_kpi_type", ["kpi_type"])
    .index("by_period", ["period"]),

  // --- DOMAIN 9: ADVANCED QR SESSIONS SYSTEM ---

  qr_sessions: defineTable({
    company_id: v.id("companies"),
    establishment_id: v.id("establishments"),
    table_id: v.id("tables"),
    session_code: v.string(), // Unique session identifier
    status: v.union(v.literal("active"), v.literal("closed"), v.literal("expired")),
    
    // Session metadata
    start_time: v.number(),
    end_time: v.optional(v.number()),
    duration_minutes: v.optional(v.number()),
    
    // Customer data
    customers: v.optional(v.array(v.any())), // Array of customer data
    customer_count: v.number(),
    
    // Session behavior
    interaction_count: v.number(), // How many times they interacted
    order_count: v.number(), // Orders placed in this session
    total_amount: v.number(), // Total revenue from this session
    
    // Device and platform info
    device_type: v.union(v.literal("mobile"), v.literal("tablet"), v.literal("desktop")),
    platform: v.union(v.literal("whatsapp"), v.literal("web"), v.literal("app")),
    
    // Analytics
    bounce_rate: v.optional(v.number()), // Sessions without orders
    conversion_time: v.optional(v.number()), // Time to first order
    
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_table", ["table_id"])
    .index("by_establishment", ["establishment_id"])
    .index("by_code", ["session_code"])
    .index("by_status", ["status"])
    .index("by_date", ["start_time"]),

});
