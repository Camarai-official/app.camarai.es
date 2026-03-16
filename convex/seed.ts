import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Script de Seed Actualizado para el Nuevo Esquema Aplanado de Camarai
 * Llena la base de datos con un establecimiento real de prueba y su catálogo operativo.
 */
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. ESTABLECIMIENTO (Aplanado)
    const establishmentId = await ctx.db.insert("establishments", {
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
      order: 1,
      created_at: Date.now(),
    });

    // 7. RECETAS (product_ingredients)
    await ctx.db.insert("product_ingredients", {
      product_id: productId,
      ingredient_id: ingredientId,
      quantity_required: 1, // 1 unidad por hamburguesa
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

    await ctx.db.insert("tables", {
      environment_id: envId,
      number: 1,
      capacity: 4,
      status: "free",
      x: 100, y: 100, width: 80, height: 80, rotation: 0,
      shape: "square",
    });

    // 9. CLIENTES
    await ctx.db.insert("customers", {
      establishment_id: establishmentId,
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

    return {
      success: true,
      establishmentId,
      productId,
    };
  },
});
