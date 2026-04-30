import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// --- QUERIES ---

export const getProducts = query({
  args: { 
    establishmentId: v.optional(v.id("establishments")),
    categoryId: v.optional(v.id("categories")),
    activeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!args.establishmentId) {
      return [];
    }

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId!)
      );

    if (args.categoryId) {
      productsQuery = productsQuery.filter(q => q.eq(q.field("category_id"), args.categoryId));
    }

    if (args.activeOnly) {
      productsQuery = productsQuery.filter(q => q.eq(q.field("active"), true));
    }

    const products = await productsQuery.collect();
    
    // Get category information for each product
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.category_id);
        return {
          ...product,
          category_name: category?.name || "Sin categoría",
          net_margin: product.net_margin ?? 0, // Usar el margen guardado, default 0
        };
      })
    );

    return productsWithCategories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getProductById = query({
  args: { 
    productId: v.id("products")
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      return null;
    }

    // Get category information
    const category = await ctx.db.get(product.category_id);
    
    // Get product ingredients
    const productIngredients = await ctx.db
      .query("product_ingredients")
      .withIndex("by_product", q => q.eq("product_id", args.productId))
      .collect();

    // Get ingredient details for each product ingredient
    const ingredientsWithDetails = await Promise.all(
      productIngredients.map(async (productIngredient) => {
        const ingredient = await ctx.db.get(productIngredient.ingredient_id);
        return {
          id_ingrediente: productIngredient.ingredient_id,
          cantidad_requerida: productIngredient.quantity_required,
          unidad_medida: productIngredient.unit || ingredient?.unit || 'units',
          nombre_ingrediente: ingredient?.name || 'Unknown',
          costo_unitario: ingredient?.cost_base || 0
        };
      })
    );
    
    return {
      ...product,
      category_name: category?.name || "Sin categoría",
      ingredientes_asociados: ingredientsWithDetails
    };
  },
});

// --- MUTATIONS ---

export const createProduct = mutation({
  args: {
    establishmentId: v.id("establishments"),
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    cost: v.optional(v.number()),
    taxId: v.id("taxes"),
    available: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    ingredients: v.optional(v.array(v.object({
      ingredientId: v.id("ingredients"),
      quantity: v.number(),
      unit: v.string()
    }))),
    variants: v.optional(v.array(v.object({
      id: v.string(),
      nombre: v.string(),
      precio_extra: v.number(),
      disponible: v.boolean()
    }))),
    allergens: v.optional(v.array(v.string())),
    availabilityHours: v.optional(v.union(
      v.object({ start: v.string(), end: v.string() }),
      v.null()
    )),
    stockMinimo: v.optional(v.number()),
    impresoraDestino: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Verify category belongs to the same establishment
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.establishment_id !== args.establishmentId) {
      throw new Error("Invalid category for this establishment");
    }

    const productId = await ctx.db.insert("products", {
      establishment_id: args.establishmentId,
      category_id: args.categoryId,
      name: args.name,
      description: args.description,
      price: args.price, // In cents
      cost: args.cost || 0, // In cents
      tax_id: args.taxId,
      active: args.available ?? true,
      image: args.imageUrl,
      is_elaborated: false,
      allergens: args.allergens || [],
      preparation_time: 0,
      available_pos: true,
      available_delivery: true,
      availability_hours: args.availabilityHours || null,
      stock_minimo: args.stockMinimo || 0,
      impresora_destino: args.impresoraDestino || 'caja',
      order: 0,
      variants: args.variants || [],
      created_at: now,
    });

    // Add recipe ingredients if provided
    if (args.ingredients && args.ingredients.length > 0) {
      for (const ingredient of args.ingredients) {
        await ctx.db.insert("product_ingredients", {
          product_id: productId,
          ingredient_id: ingredient.ingredientId,
          quantity_required: ingredient.quantity,
          unit: ingredient.unit,
        });
      }
    }

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    categoryId: v.optional(v.id("categories")),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    cost: v.optional(v.number()),
    taxId: v.optional(v.id("taxes")),
    available: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    ingredients: v.optional(v.array(v.object({
      ingredientId: v.id("ingredients"),
      quantity: v.number(),
      unit: v.string()
    }))),
    variants: v.optional(v.array(v.object({
      id: v.string(),
      nombre: v.string(),
      precio_extra: v.number(),
      disponible: v.boolean()
    }))),
    allergens: v.optional(v.array(v.string())),
    availabilityHours: v.optional(v.union(
      v.object({ start: v.string(), end: v.string() }),
      v.null()
    )),
    stockMinimo: v.optional(v.number()),
    impresoraDestino: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, categoryId, name, description, price, cost, taxId, available, imageUrl, ingredients, variants, allergens, availabilityHours, stockMinimo, impresoraDestino } = args;
    
    const existingProduct = await ctx.db.get(productId);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // If category is being updated, verify it belongs to the same establishment
    if (categoryId) {
      const category = await ctx.db.get(categoryId);
      if (!category || category.establishment_id !== existingProduct.establishment_id) {
        throw new Error("Invalid category for this establishment");
      }
    }

    // Build update object with correct field names
    const updateData: any = {};
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost;
    if (taxId !== undefined) updateData.tax_id = taxId;
    if (available !== undefined) updateData.active = available;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (variants !== undefined) updateData.variants = variants;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (availabilityHours !== undefined) updateData.availability_hours = availabilityHours;
    if (stockMinimo !== undefined) updateData.stock_minimo = stockMinimo;
    if (impresoraDestino !== undefined) updateData.impresora_destino = impresoraDestino || 'caja';

    const updatedProduct = await ctx.db.patch(productId, updateData);

    // Calcular y guardar el margen neto
    const tax = await ctx.db.get(existingProduct.tax_id);
    const taxPercent = tax?.percentage || 0;
    const basePrice = ((price !== undefined ? price : existingProduct.price) / (1 + taxPercent / 100)) / 100;
    const currentCost = cost !== undefined ? cost : existingProduct.cost;
    const netMargin = basePrice - (currentCost / 100);
    
    await ctx.db.patch(productId, {
      net_margin: netMargin
    });

    // Update ingredients if provided
    if (ingredients !== undefined) {
      // Delete existing ingredients
      const existingIngredients = await ctx.db
        .query("product_ingredients")
        .withIndex("by_product", q => q.eq("product_id", productId))
        .collect();
      
      for (const existingIngredient of existingIngredients) {
        await ctx.db.delete(existingIngredient._id);
      }

      // Add new ingredients
      for (const ingredient of ingredients) {
        await ctx.db.insert("product_ingredients", {
          product_id: productId,
          ingredient_id: ingredient.ingredientId,
          quantity_required: ingredient.quantity,
          unit: ingredient.unit,
        });
      }
    }

    return updatedProduct;
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.delete(args.productId);
    return { success: true };
  },
});

export const toggleProductAvailability = mutation({
  args: {
    productId: v.id("products"),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct = await ctx.db.patch(args.productId, {
      active: args.available
    });

    return updatedProduct;
  },
});

export const updateProductCategory = mutation({
  args: {
    productId: v.id("products"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct = await ctx.db.patch(args.productId, {
      category_id: args.categoryId
    });

    return updatedProduct;
  },
});

export const updateProductsCategory = mutation({
  args: {
    productIds: v.array(v.id("products")),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const updatedProducts = [];
    
    for (const productId of args.productIds) {
      const product = await ctx.db.get(productId);
      if (product) {
        await ctx.db.patch(productId, {
          category_id: args.categoryId
        });
        updatedProducts.push(productId);
      }
    }

    return updatedProducts;
  },
});

// Helper function to get taxes for dropdown
export const getTaxes = query({
  args: { 
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const taxes = await ctx.db
      .query("taxes")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    return taxes.sort((a, b) => a.name.localeCompare(b.name));
  },
});


// =============================================================================
// Recipe (product_ingredients) queries & mutations for the AI agent
// =============================================================================

/**
 * Get recipe (ingredients) for a product by its ID or name.
 * Used by the manager agent to inspect what ingredients compose a dish.
 */
export const getProductRecipe = query({
  args: {
    establishmentId: v.id("establishments"),
    productId: v.optional(v.id("products")),
    productName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let productId = args.productId;

    // Resolve by name if productId not provided
    if (!productId && args.productName) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
        .collect();

      const nameLower = args.productName.toLowerCase();
      const match = products.find(p => p.name.toLowerCase().includes(nameLower));
      if (!match) return { error: `Producto '${args.productName}' no encontrado.`, recipe: [] };
      productId = match._id;
    }

    if (!productId) return { error: "Se requiere productId o productName.", recipe: [] };

    const product = await ctx.db.get(productId);
    if (!product) return { error: "Producto no encontrado.", recipe: [] };

    const recipeItems = await ctx.db
      .query("product_ingredients")
      .withIndex("by_product", q => q.eq("product_id", productId!))
      .collect();

    if (recipeItems.length === 0) {
      return {
        product_name: product.name,
        product_id: productId,
        recipe: [],
        message: "Este producto no tiene receta definida.",
      };
    }

    const recipe = await Promise.all(
      recipeItems.map(async (item) => {
        const ingredient = await ctx.db.get(item.ingredient_id);
        return {
          ingredient_id: item.ingredient_id,
          ingredient_name: ingredient?.name || "?",
          quantity_required: item.quantity_required,
          unit: item.unit,
          current_stock: ingredient?.stock || 0,
          alert_min: ingredient?.alert_min || 0,
        };
      })
    );

    return {
      product_name: product.name,
      product_id: productId,
      recipe,
    };
  },
});

/**
 * Set recipe for a product (replace all ingredients).
 * The manager agent can use this to define/update a dish's recipe via chat.
 */
export const setProductRecipe = mutation({
  args: {
    productId: v.id("products"),
    ingredients: v.array(v.object({
      ingredientId: v.id("ingredients"),
      quantity: v.number(),
      unit: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Producto no encontrado");

    // Delete existing recipe
    const existing = await ctx.db
      .query("product_ingredients")
      .withIndex("by_product", q => q.eq("product_id", args.productId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Insert new recipe items
    for (const ing of args.ingredients) {
      await ctx.db.insert("product_ingredients", {
        product_id: args.productId,
        ingredient_id: ing.ingredientId,
        quantity_required: ing.quantity,
        unit: ing.unit,
      });
    }

    return { success: true, product_name: product.name, ingredients_count: args.ingredients.length };
  },
});

/**
 * Add a single ingredient to a product's recipe (without replacing existing ones).
 * Useful for incremental recipe building via chat.
 */
export const addRecipeIngredient = mutation({
  args: {
    productId: v.id("products"),
    ingredientId: v.id("ingredients"),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Producto no encontrado");

    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) throw new Error("Ingrediente no encontrado");

    // Check if already exists — update quantity instead of duplicating
    const existing = await ctx.db
      .query("product_ingredients")
      .withIndex("by_product", q => q.eq("product_id", args.productId))
      .collect();

    const existingItem = existing.find(e => e.ingredient_id === args.ingredientId);
    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        quantity_required: args.quantity,
        unit: args.unit,
      });
      return { action: "updated", product_name: product.name, ingredient_name: ingredient.name, quantity: args.quantity, unit: args.unit };
    }

    await ctx.db.insert("product_ingredients", {
      product_id: args.productId,
      ingredient_id: args.ingredientId,
      quantity_required: args.quantity,
      unit: args.unit,
    });

    return { action: "added", product_name: product.name, ingredient_name: ingredient.name, quantity: args.quantity, unit: args.unit };
  },
});
