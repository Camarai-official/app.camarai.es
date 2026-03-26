import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// --- QUERIES ---

export const getIngredients = query({
  args: { 
    establishmentId: v.optional(v.id("establishments")),
    categoryId: v.optional(v.id("ingredient_categories")),
    lowStock: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!args.establishmentId) {
      return [];
    }

    let ingredientsQuery = ctx.db
      .query("ingredients")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId)
      );

    if (args.categoryId) {
      ingredientsQuery = ingredientsQuery.filter(q => q.eq(q.field("category_id"), args.categoryId));
    }

    if (args.lowStock) {
      ingredientsQuery = ingredientsQuery.filter(q => q.lte(q.field("stock"), q.field("alert_min")));
    }

    const ingredients = await ingredientsQuery.collect();
    
    // Get category information for each ingredient
    const ingredientsWithCategories = await Promise.all(
      ingredients.map(async (ingredient) => {
        const category = await ctx.db.get(ingredient.category_id);
        return {
          ...ingredient,
          category_name: category?.name || "Sin categoría"
        };
      })
    );

    return ingredientsWithCategories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getIngredientById = query({
  args: { 
    ingredientId: v.id("ingredients")
  },
  handler: async (ctx, args) => {
    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) {
      return null;
    }

    // Get category information
    const category = await ctx.db.get(ingredient.category_id);
    
    return {
      ...ingredient,
      category_name: category?.name || "Sin categoría"
    };
  },
});

export const getIngredientCategories = query({
  args: { 
    establishmentId: v.id("establishments")
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("ingredient_categories")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    return categories.sort((a, b) => a.order - b.order);
  },
});

// --- MUTATIONS ---

export const createIngredient = mutation({
  args: {
    establishmentId: v.id("establishments"),
    categoryId: v.id("ingredient_categories"),
    name: v.string(),
    stock: v.number(),
    alertMin: v.number(),
    stockMax: v.optional(v.number()),
    unit: v.union(v.literal("kg"), v.literal("units"), v.literal("liters"), v.literal("grams")),
    costBase: v.number(),
    supplier: v.optional(v.string()),
    barcode: v.optional(v.string()),
    conversions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Verify category belongs to the same establishment
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.establishment_id !== args.establishmentId) {
      throw new Error("Invalid category for this establishment");
    }

    const ingredientId = await ctx.db.insert("ingredients", {
      establishment_id: args.establishmentId,
      category_id: args.categoryId,
      name: args.name,
      stock: args.stock,
      alert_min: args.alertMin,
      stock_max: args.stockMax,
      unit: args.unit,
      cost_base: args.costBase,
      supplier: args.supplier,
      barcode: args.barcode,
      conversions: args.conversions,
      created_at: now,
    });

    return ingredientId;
  },
});

export const updateIngredient = mutation({
  args: {
    ingredientId: v.id("ingredients"),
    categoryId: v.optional(v.id("ingredient_categories")),
    name: v.optional(v.string()),
    stock: v.optional(v.number()),
    alertMin: v.optional(v.number()),
    stockMax: v.optional(v.number()),
    unit: v.optional(v.union(v.literal("kg"), v.literal("units"), v.literal("liters"), v.literal("grams"))),
    costBase: v.optional(v.number()),
    supplier: v.optional(v.string()),
    barcode: v.optional(v.string()),
    conversions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { ingredientId, categoryId, name, stock, alertMin, stockMax, unit, costBase, supplier, barcode, conversions } = args;
    
    const existingIngredient = await ctx.db.get(ingredientId);
    if (!existingIngredient) {
      throw new Error("Ingredient not found");
    }

    // If category is being updated, verify it belongs to the same establishment
    if (categoryId) {
      const category = await ctx.db.get(categoryId);
      if (!category || category.establishment_id !== existingIngredient.establishment_id) {
        throw new Error("Invalid category for this establishment");
      }
    }

    // Build update object with correct field names
    const updateData: any = {};
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (name !== undefined) updateData.name = name;
    if (stock !== undefined) updateData.stock = stock;
    if (alertMin !== undefined) updateData.alert_min = alertMin;
    if (stockMax !== undefined) updateData.stock_max = stockMax;
    if (unit !== undefined) updateData.unit = unit;
    if (costBase !== undefined) updateData.cost_base = costBase;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (conversions !== undefined) updateData.conversions = conversions;

    const updatedIngredient = await ctx.db.patch(ingredientId, updateData);
    return updatedIngredient;
  },
});

export const deleteIngredient = mutation({
  args: {
    ingredientId: v.id("ingredients"),
  },
  handler: async (ctx, args) => {
    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    // Check if ingredient is used in any product recipes
    const productIngredients = await ctx.db
      .query("product_ingredients")
      .collect();

    const ingredientUsage = productIngredients.filter(pi => pi.ingredient_id === args.ingredientId);

    if (ingredientUsage.length > 0) {
      throw new Error("No se puede eliminar el ingrediente porque está siendo utilizado en recetas de productos");
    }

    await ctx.db.delete(args.ingredientId);
    return { success: true };
  },
});

export const adjustStock = mutation({
  args: {
    ingredientId: v.id("ingredients"),
    newStock: v.number(),
    adjustmentType: v.union(v.literal("add"), v.literal("remove"), v.literal("set")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    let newStockValue: number;
    
    switch (args.adjustmentType) {
      case "add":
        newStockValue = ingredient.stock + args.newStock;
        break;
      case "remove":
        newStockValue = Math.max(0, ingredient.stock - args.newStock);
        break;
      case "set":
        newStockValue = args.newStock;
        break;
      default:
        throw new Error("Invalid adjustment type");
    }

    const updatedIngredient = await ctx.db.patch(args.ingredientId, {
      stock: newStockValue
    });

    return updatedIngredient;
  },
});

// --- CATEGORIES ---

export const createIngredientCategory = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the highest order if not provided
    let order = args.order;
    if (order === undefined) {
      const categories = await ctx.db
        .query("ingredient_categories")
        .withIndex("by_establishment", q => q.eq("establishment_id", args.establishmentId))
        .collect();
      
      order = categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 0;
    }

    const categoryId = await ctx.db.insert("ingredient_categories", {
      establishment_id: args.establishmentId,
      name: args.name,
      order: order,
      created_at: now,
    });

    return categoryId;
  },
});

export const updateIngredientCategory = mutation({
  args: {
    categoryId: v.id("ingredient_categories"),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { categoryId, name, order } = args;
    
    const existingCategory = await ctx.db.get(categoryId);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (order !== undefined) updateData.order = order;

    const updatedCategory = await ctx.db.patch(categoryId, updateData);
    return updatedCategory;
  },
});

export const deleteIngredientCategory = mutation({
  args: {
    categoryId: v.id("ingredient_categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has ingredients
    const ingredients = await ctx.db
      .query("ingredients")
      .withIndex("by_establishment", q => q.eq("establishment_id", category.establishment_id))
      .filter(q => q.eq(q.field("category_id"), args.categoryId))
      .collect();

    if (ingredients.length > 0) {
      throw new Error("No se puede eliminar la categoría porque tiene ingredientes asociados");
    }

    await ctx.db.delete(args.categoryId);
    return { success: true };
  },
});
