import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// --- QUERIES ---

export const getCategories = query({
  args: { 
    establishmentId: v.optional(v.id("establishments")),
    activeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (!args.establishmentId) {
      return [];
    }

    let categoriesQuery = ctx.db
      .query("categories")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId!)
      );

    if (args.activeOnly) {
      categoriesQuery = categoriesQuery.filter(q => q.eq(q.field("active"), true));
    }

    const categories = await categoriesQuery.collect();
    
    // Get product count for each category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_category", q => q.eq("category_id", category._id))
          .collect();

        return {
          ...category,
          product_count: products.length
        };
      })
    );

    return categoriesWithProductCount.sort((a, b) => a.order - b.order);
  },
});

export const getCategoryById = query({
  args: { 
    categoryId: v.id("categories")
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      return null;
    }

    // Get product count
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", q => q.eq("category_id", category._id))
      .collect();

    return {
      ...category,
      product_count: products.length
    };
  },
});

// --- MUTATIONS ---

export const createCategory = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    bannerImage: v.optional(v.union(v.string(), v.null())),
    active: v.optional(v.boolean()),
    printerDestination: v.optional(v.string()),
    visibleInMenu: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the highest order number for this establishment
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();
    
    const maxOrder = Math.max(...existingCategories.map(c => c.order), 0);

    const categoryId = await ctx.db.insert("categories", {
      establishment_id: args.establishmentId,
      name: args.name,
      description: args.description,
      icon: args.icon || "Utensils",
      color: args.color || "blue-400",
      bannerImage: args.bannerImage,
      active: args.active ?? true,
      order: maxOrder + 1,
      printerDestination: args.printerDestination,
      visibleInMenu: args.visibleInMenu,
      created_at: now,
    });

    return categoryId;
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    bannerImage: v.optional(v.union(v.string(), v.null())),
    active: v.optional(v.boolean()),
    order: v.optional(v.number()),
    printerDestination: v.optional(v.string()),
    visibleInMenu: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updateData } = args;
    
    const existingCategory = await ctx.db.get(categoryId);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Handle bannerImage: if undefined, set to null to remove the image
    if (updateData.bannerImage === undefined) {
      updateData.bannerImage = null;
    }

    const updatedCategory = await ctx.db.patch(categoryId, updateData);
    return updatedCategory;
  },
});

export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if there are products in this category
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", q => q.eq("category_id", args.categoryId))
      .collect();

    if (products.length > 0) {
      throw new Error("Cannot delete category with existing products");
    }

    await ctx.db.delete(args.categoryId);
    return { success: true };
  },
});

export const toggleCategoryStatus = mutation({
  args: {
    categoryId: v.id("categories"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const updatedCategory = await ctx.db.patch(args.categoryId, {
      active: args.active
    });

    return updatedCategory;
  },
});

export const ensureDefaultCategory = mutation({
  args: {
    establishmentId: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    // Check if "Sin categoría" already exists
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_establishment", q => 
        q.eq("establishment_id", args.establishmentId)
      )
      .collect();

    const defaultCategory = existingCategories.find(cat => cat.name === "Sin categoría");

    if (defaultCategory) {
      return defaultCategory._id;
    }

    // Create "Sin categoría" if it doesn't exist
    const now = Date.now();
    const maxOrder = Math.max(...existingCategories.map(c => c.order), 0);

    const categoryId = await ctx.db.insert("categories", {
      establishment_id: args.establishmentId,
      name: "Sin categoría",
      description: "Productos sin categoría asignada",
      icon: "Package",
      color: "gray-400",
      active: true,
      order: maxOrder + 1,
      printerDestination: "caja",
      visibleInMenu: false, // Hide from menu
      created_at: now,
    });

    return categoryId;
  },
});

export const reorderCategories = mutation({
  args: {
    establishmentId: v.id("establishments"),
    categoryOrders: v.array(v.object({
      categoryId: v.id("categories"),
      order: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Update order for each category
    for (const { categoryId, order } of args.categoryOrders) {
      await ctx.db.patch(categoryId, { order });
    }

    return { success: true };
  },
});
