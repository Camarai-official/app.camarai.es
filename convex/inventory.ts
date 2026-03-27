import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

/**
 * Procedimiento de descuento de stock basado en receta 
 * (Equivalente al Procedure sp_deduct_order_stock de SQL)
 */
export const deductStockFromOrder = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    for (const item of items) {
      // 1. Buscamos los ingredientes necesarios para este producto (Receta)
      const recipe = await ctx.db
        .query("product_ingredients")
        .withIndex("by_product", (q) => q.eq("product_id", item.product_id))
        .collect();

      for (const ingredientInfo of recipe) {
        const ingredient = await ctx.db.get(ingredientInfo.ingredient_id);
        if (ingredient) {
          const totalToDeduct = ingredientInfo.quantity_required * item.quantity;
          
          // 2. Actualizamos el stock físico
          await ctx.db.patch(ingredient._id, {
            stock: ingredient.stock - totalToDeduct,
          });

          // 3. Registramos el movimiento (Paridad con stock_movements de SQL)
          await ctx.db.insert("stock_movements", {
            ingredient_id: ingredient._id,
            establishment_id: ingredient.establishment_id,
            type: "auto_deduction",
            quantity: -totalToDeduct,
            unit_cost: ingredient.cost_base,
            total_cost: ingredient.cost_base * totalToDeduct,
            timestamp: Date.now(),
            staff_id: "system", // Triggered by internal mutation
            notes: `Auto-descuento por Venta Orden: ${args.orderId}`,
          });
        }
      }
    }
  },
});

/**
 * Fijar stock exacto (Para ajustes de inventario)
 */
export const setStockExact = mutation({
  args: {
    ingredientId: v.id("ingredients"),
    newStock: v.number(),
    staffId: v.id("staff"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) throw new Error("Ingrediente no encontrado");

    const currentStock = ingredient.stock;
    const adjustmentQuantity = args.newStock - currentStock;

    await ctx.db.patch(args.ingredientId, {
      stock: args.newStock,
    });

    await ctx.db.insert("stock_movements", {
      ingredient_id: args.ingredientId,
      establishment_id: ingredient.establishment_id,
      type: "adjustment",
      quantity: adjustmentQuantity,
      unit_cost: ingredient.cost_base,
      total_cost: ingredient.cost_base * Math.abs(adjustmentQuantity),
      timestamp: Date.now(),
      staff_id: args.staffId,
      notes: args.notes || `Fijar stock a ${args.newStock} ${ingredient.unit}`,
    });
  },
});
export const adjustStockManually = mutation({
  args: {
    ingredientId: v.id("ingredients"),
    adjustmentQuantity: v.number(),
    type: v.union(v.literal("adjustment"), v.literal("waste"), v.literal("purchase"), v.literal("sale"), v.literal("return")),
    staffId: v.id("staff"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ingredient = await ctx.db.get(args.ingredientId);
    if (!ingredient) throw new Error("Ingrediente no encontrado");

    await ctx.db.patch(args.ingredientId, {
      stock: ingredient.stock + args.adjustmentQuantity,
    });

    await ctx.db.insert("stock_movements", {
      ingredient_id: args.ingredientId,
      establishment_id: ingredient.establishment_id,
      type: args.type,
      quantity: args.adjustmentQuantity,
      unit_cost: ingredient.cost_base,
      total_cost: ingredient.cost_base * Math.abs(args.adjustmentQuantity),
      timestamp: Date.now(),
      staff_id: args.staffId,
      notes: args.notes || `Ajuste manual de ${args.type}`,
    });
  },
});
