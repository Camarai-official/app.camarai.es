import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// --- QUERIES ---

export const getCartas = query({
  args: { 
    establishmentId: v.optional(v.id("establishments")),
    activeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!args.establishmentId) {
      return [];
    }

    const menus = await ctx.db
      .query("menu")
      .withIndex("by_establishment_type", q => 
        q.eq("establishment_id", args.establishmentId!).eq("type", "carta")
      )
      .collect();

    if (args.activeOnly) {
      return menus.filter(menu => menu.active);
    }

    // Get sections for each menu
    const menusWithSections = await Promise.all(
      menus.map(async (menu) => {
        const sections = await ctx.db
          .query("menu_sections")
          .withIndex("by_menu", q => q.eq("menu_id", menu._id))
          .collect();

        return {
          ...menu,
          elementos_carta: sections.map(section => ({
            id: section._id,
            tipo: section.element_type,
            id_elemento: section.element_id,
            orden: section.display_order
          }))
        };
      })
    );

    return menusWithSections;
  },
});

export const getCartaById = query({
  args: { 
    cartaId: v.id("menu")
  },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.cartaId);
    if (!menu || menu.type !== "carta") return null;

    // Get sections for this menu
    const sections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", menu._id))
      .collect();

    return {
      ...menu,
      elementos_carta: sections.map(section => ({
        id: section._id,
        tipo: section.element_type,
        id_elemento: section.element_id,
        orden: section.display_order
      }))
    };
  },
});

export const getCartaElements = query({
  args: { 
    cartaId: v.id("menu")
  },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();

    return sections.map(section => ({
      id: section._id,
      tipo: section.element_type,
      id_elemento: section.element_id,
      orden: section.display_order
    }));
  },
});

// --- MUTATIONS ---

export const createCarta = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    active: v.optional(v.boolean()), // Nuevo parámetro para el estado
    whatsappEnabled: v.optional(v.boolean()),
    whatsappVoiceEnabled: v.optional(v.boolean()),
    whatsappWelcomeMessage: v.optional(v.string()),
    whatsappScheduleStart: v.optional(v.string()),
    whatsappScheduleEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the highest order number for this establishment
    const existingMenus = await ctx.db
      .query("menu")
      .withIndex("by_establishment_type", q => 
        q.eq("establishment_id", args.establishmentId).eq("type", "carta")
      )
      .collect();
    
    const maxOrder = Math.max(...existingMenus.map(m => m.order || 0), 0);

    const menuId = await ctx.db.insert("menu", {
      establishment_id: args.establishmentId,
      name: args.name,
      description: args.description,
      type: "carta",
      active: args.active ?? false, // Usar el estado del usuario o false por defecto
      icon: args.icon || "BookOpen",
      color: args.color || "blue-400",
      whatsapp_enabled: args.whatsappEnabled ?? true,
      whatsapp_voice_enabled: args.whatsappVoiceEnabled ?? true,
      whatsapp_welcome_message: args.whatsappWelcomeMessage || "¡Hola! Bienvenido a nuestro restaurante. ¿Qué te gustaría pedir hoy?",
      whatsapp_schedule_start: args.whatsappScheduleStart || "12:00",
      whatsapp_schedule_end: args.whatsappScheduleEnd || "23:00",
      order: maxOrder + 1,
      product_ids: [], // Empty array for carta type
      available_days: [], // Empty array for carta type
      created_at: now,
      updated_at: now,
    });

    return menuId;
  },
});

export const updateCarta = mutation({
  args: {
    cartaId: v.id("menu"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    active: v.optional(v.boolean()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    whatsappEnabled: v.optional(v.boolean()),
    whatsappVoiceEnabled: v.optional(v.boolean()),
    whatsappWelcomeMessage: v.optional(v.string()),
    whatsappScheduleStart: v.optional(v.string()),
    whatsappScheduleEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { cartaId, ...updates } = args;
    const now = Date.now();

    const menu = await ctx.db.get(cartaId);
    if (!menu || menu.type !== "carta") {
      throw new Error("Carta not found");
    }

    const updateData: any = {
      updated_at: now,
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.whatsappEnabled !== undefined) updateData.whatsapp_enabled = updates.whatsappEnabled;
    if (updates.whatsappVoiceEnabled !== undefined) updateData.whatsapp_voice_enabled = updates.whatsappVoiceEnabled;
    if (updates.whatsappWelcomeMessage !== undefined) updateData.whatsapp_welcome_message = updates.whatsappWelcomeMessage;
    if (updates.whatsappScheduleStart !== undefined) updateData.whatsapp_schedule_start = updates.whatsappScheduleStart;
    if (updates.whatsappScheduleEnd !== undefined) updateData.whatsapp_schedule_end = updates.whatsappScheduleEnd;

    await ctx.db.patch(cartaId, updateData);
    return cartaId;
  },
});

export const deleteCarta = mutation({
  args: {
    cartaId: v.id("menu"),
  },
  handler: async (ctx, args) => {
    // First delete all sections of this menu
    const sections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();

    for (const section of sections) {
      await ctx.db.delete(section._id);
    }

    // Then delete the menu
    await ctx.db.delete(args.cartaId);
    return args.cartaId;
  },
});

export const addElementToCarta = mutation({
  args: {
    cartaId: v.id("menu"),
    elementType: v.union(v.literal("category"), v.literal("menu"), v.literal("product")),
    elementId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the highest order number for this menu
    const existingSections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();
    
    const maxOrder = Math.max(...existingSections.map(section => section.display_order), 0);

    const sectionId = await ctx.db.insert("menu_sections", {
      menu_id: args.cartaId,
      element_type: args.elementType,
      element_id: args.elementId,
      display_order: maxOrder + 1,
      created_at: now,
    });

    return sectionId;
  },
});

export const addCategoryWithProductsToCarta = mutation({
  args: {
    cartaId: v.id("menu"),
    categoryId: v.id("categories"),
    includeProducts: v.boolean(), // Whether to also add individual products
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the highest order number for this menu
    const existingSections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();
    
    const maxOrder = Math.max(...existingSections.map(section => section.display_order), 0);

    // Add the category to the carta
    const categorySectionId = await ctx.db.insert("menu_sections", {
      menu_id: args.cartaId,
      element_type: "category",
      element_id: args.categoryId,
      display_order: maxOrder + 1,
      created_at: now,
    });

    // If includeProducts is true, also add all products from this category
    if (args.includeProducts) {
      // Get all products in this category
      const categoryProducts = await ctx.db
        .query("products")
        .withIndex("by_category", q => q.eq("category_id", args.categoryId))
        .collect();

      // Add each product to the carta
      for (const product of categoryProducts) {
        const currentMaxOrder = Math.max(
          ...[
            ...existingSections.map(section => section.display_order),
            maxOrder + 1
          ], 
          0
        );

        await ctx.db.insert("menu_sections", {
          menu_id: args.cartaId,
          element_type: "product",
          element_id: product._id,
          display_order: currentMaxOrder + 1,
          created_at: now,
        });
      }
    }

    return {
      categorySectionId,
      productsAdded: args.includeProducts ? "All products from category added" : "Only category added"
    };
  },
});

export const syncCartaWithCategories = mutation({
  args: {
    cartaId: v.id("menu"),
    categoryIds: v.array(v.id("categories")),
    includeProducts: v.boolean(), // Whether to include all products from categories
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // First, remove all existing sections from this carta
    const existingSections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();

    for (const section of existingSections) {
      await ctx.db.delete(section._id);
    }

    // Collect all product IDs from the selected categories
    const allProductIds: string[] = [];

    // Now add all categories and optionally their products
    let displayOrder = 0;

    for (const categoryId of args.categoryIds) {
      // Add the category
      await ctx.db.insert("menu_sections", {
        menu_id: args.cartaId,
        element_type: "category",
        element_id: categoryId,
        display_order: displayOrder++,
        created_at: now,
      });

      // Get all products from this category
      const categoryProducts = await ctx.db
        .query("products")
        .withIndex("by_category", q => q.eq("category_id", categoryId))
        .collect();

      // Add product IDs to the collection
      const productIds = categoryProducts.map(product => product._id);
      allProductIds.push(...productIds);

      // If includeProducts is true, also add individual product sections
      if (args.includeProducts) {
        for (const product of categoryProducts) {
          await ctx.db.insert("menu_sections", {
            menu_id: args.cartaId,
            element_type: "product",
            element_id: product._id,
            display_order: displayOrder++,
            created_at: now,
          });
        }
      }
    }

    // Update the menu with all product IDs
    await ctx.db.patch(args.cartaId, {
      product_ids: allProductIds as Id<"products">[],
      updated_at: now,
    });

    return {
      cartaId: args.cartaId,
      categoriesAdded: args.categoryIds.length,
      includeProducts: args.includeProducts,
      totalSections: displayOrder,
      totalProducts: allProductIds.length
    };
  },
});

export const removeCategoryFromCarta = mutation({
  args: {
    cartaId: v.id("menu"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // Find the menu_section record for this category in this carta
    const sections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", q => q.eq("menu_id", args.cartaId))
      .collect();
    
    const sectionToRemove = sections.find(section => 
      section.element_type === "category" && section.element_id === args.categoryId
    );
    
    if (sectionToRemove) {
      await ctx.db.delete(sectionToRemove._id);
      return sectionToRemove._id;
    }
    
    throw new Error("Category not found in carta");
  },
});

export const removeElementFromCarta = mutation({
  args: {
    elementId: v.id("menu_sections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.elementId);
    return args.elementId;
  },
});

export const updateElementOrder = mutation({
  args: {
    cartaId: v.id("menu"),
    elements: v.array(v.object({
      id: v.id("menu_sections"),
      display_order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const element of args.elements) {
      await ctx.db.patch(element.id, {
        display_order: element.display_order,
      });
    }
    return true;
  },
});

export const toggleCartaStatus = mutation({
  args: {
    cartaId: v.id("menu"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.cartaId);
    if (!menu || menu.type !== "carta") {
      throw new Error("Carta not found");
    }

    await ctx.db.patch(args.cartaId, {
      active: args.active,
      updated_at: Date.now(),
    });

    return args.cartaId;
  },
});

// =============================================================================
// PUBLIC QUERY: Full menu for a table session (used by camarai_menu-privado)
// =============================================================================

/**
 * Get the full menu for a table session.
 *
 * Chain: table_sessions → tables → environments → establishments
 *        → active carta → menu_sections (categories) → products
 *
 * Returns the menu grouped by category in the format the web app expects:
 * {
 *   session: { id, guests, table_number, ... },
 *   establishment: { name, currency },
 *   menu: { "Category Name": [ { nombre_producto, variaciones, url, ... } ] }
 * }
 */
export const getMenuForSession = query({
  args: {
    sessionId: v.id("table_sessions"),
  },
  handler: async (ctx, args) => {
    // 1. Get session
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      return { error: "Sesión no encontrada o cerrada" };
    }

    // 2. Get table
    const table = await ctx.db.get(session.table_id);
    if (!table) {
      return { error: "Mesa no encontrada" };
    }

    // 3. Get environment → establishment_id
    const environment = await ctx.db.get(table.environment_id);
    if (!environment) {
      return { error: "Entorno no encontrado" };
    }

    // 4. Get establishment
    const establishment = await ctx.db.get(environment.establishment_id);
    if (!establishment) {
      return { error: "Establecimiento no encontrado" };
    }

    const currency = establishment.currency || "EUR";

    // 5. Get the active carta for this establishment
    const cartas = await ctx.db
      .query("menu")
      .withIndex("by_establishment_type", (q) =>
        q.eq("establishment_id", environment.establishment_id).eq("type", "carta")
      )
      .collect();

    const activeCarta = cartas.find((c) => c.active);
    if (!activeCarta) {
      return {
        error: "No hay carta activa",
        session: {
          id: args.sessionId,
          guests: session.guests || 1,
          table_number: table.number,
        },
        establishment: { name: establishment.name, currency },
      };
    }

    // 6. Get menu_sections for the carta
    const sections = await ctx.db
      .query("menu_sections")
      .withIndex("by_menu", (q) => q.eq("menu_id", activeCarta._id))
      .collect();

    // Sort by display_order
    sections.sort((a, b) => a.display_order - b.display_order);

    // 7. Build menu grouped by category
    const menu: Record<string, any[]> = {};

    for (const section of sections) {
      if (section.element_type === "category") {
        // Get category
        const category = await ctx.db.get(section.element_id as Id<"categories">);
        if (!category || !category.active) continue;

        // Get active products in this category
        const products = await ctx.db
          .query("products")
          .withIndex("by_category", (q) =>
            q.eq("category_id", section.element_id as Id<"categories">)
          )
          .collect();

        const activeProducts = products.filter((p) => p.active);
        if (activeProducts.length === 0) continue;

        const categoryName = category.name;
        if (!menu[categoryName]) {
          menu[categoryName] = [];
        }

        for (const product of activeProducts) {
          if (!product.variants || product.variants.length === 0) {
            // Product without variants — single entry
            menu[categoryName].push({
              nombre_producto: product.name,
              id_categoria_detectada: categoryName,
              url: product.image || null,
              descripcion: product.description || null,
              allergens: product.allergens || [],
              variaciones: {
                name: product.name,
                price: product.price, // cents
                currency,
                item_id: product._id,
              },
            });
          } else {
            // Product with variants — one entry per variant
            for (const variant of product.variants) {
              if (!variant.disponible) continue;
              menu[categoryName].push({
                nombre_producto: product.name,
                id_categoria_detectada: categoryName,
                url: product.image || null,
                descripcion: product.description || null,
                allergens: product.allergens || [],
                variaciones: {
                  name: variant.nombre,
                  price: product.price + variant.precio_extra, // cents
                  currency,
                  item_id: `${product._id}:${variant.id}`,
                },
              });
            }
          }
        }
      } else if (section.element_type === "product") {
        // Individual product added to the carta (not via category)
        const product = await ctx.db.get(section.element_id as Id<"products">);
        if (!product || !product.active) continue;

        const category = await ctx.db.get(product.category_id);
        const categoryName = category?.name || "Otros";

        if (!menu[categoryName]) {
          menu[categoryName] = [];
        }

        if (!product.variants || product.variants.length === 0) {
          menu[categoryName].push({
            nombre_producto: product.name,
            id_categoria_detectada: categoryName,
            url: product.image || null,
            descripcion: product.description || null,
            allergens: product.allergens || [],
            variaciones: {
              name: product.name,
              price: product.price,
              currency,
              item_id: product._id,
            },
          });
        } else {
          for (const variant of product.variants) {
            if (!variant.disponible) continue;
            menu[categoryName].push({
              nombre_producto: product.name,
              id_categoria_detectada: categoryName,
              url: product.image || null,
              descripcion: product.description || null,
              allergens: product.allergens || [],
              variaciones: {
                name: variant.nombre,
                price: product.price + variant.precio_extra,
                currency,
                item_id: `${product._id}:${variant.id}`,
              },
            });
          }
        }
      }
    }

    return {
      session: {
        id: args.sessionId,
        guests: session.guests || 1,
        table_number: table.number,
        client_allergens: session.client_allergens || {},
      },
      establishment: {
        name: establishment.name,
        currency,
      },
      menu,
    };
  },
});
