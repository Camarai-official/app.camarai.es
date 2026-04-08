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
          const oldStock = ingredient.stock;
          const newStock = ingredient.stock - totalToDeduct;
          
          
          // 2. Actualizamos el stock físico
          await ctx.db.patch(ingredient._id, {
            stock: newStock,
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

          // 4. Registramos evento de alerta de stock si es necesario
          if (newStock < ingredient.alert_min) {
            await ctx.db.insert("event_log", {
              establishment_id: ingredient.establishment_id,
              type: "inventory",
              level: "warning",
              actor: "system",
              action: "Alerta de Stock",
              entity_type: "ingredient",
              entity_id: ingredient._id,
              before: { stock: oldStock },
              after: { 
                stock: newStock, 
                ingredient_name: ingredient.name,
                alert_min: ingredient.alert_min,
                deduction_amount: totalToDeduct,
                order_id: args.orderId
              },
              timestamp: Date.now(),
            });
          }
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

    const oldStock = ingredient.stock;
    const newStock = ingredient.stock + args.adjustmentQuantity;

    await ctx.db.patch(args.ingredientId, {
      stock: newStock,
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

    // Register event log for stock alerts
    let eventLevel: "info" | "warning" | "critical" = "info";
    let eventAction = "";
    
    if (newStock < ingredient.alert_min) {
      eventLevel = "warning";
      eventAction = "Alerta de Stock";
    } else if (args.type === "purchase") {
      eventAction = "Pedido Stock";
    } else {
      eventAction = "Ajuste Inventario";
    }

    await ctx.db.insert("event_log", {
      establishment_id: ingredient.establishment_id,
      type: "inventory",
      level: eventLevel,
      actor: args.staffId,
      action: eventAction,
      entity_type: "ingredient",
      entity_id: ingredient._id,
      before: { stock: oldStock },
      after: { 
        stock: newStock, 
        ingredient_name: ingredient.name,
        adjustment_type: args.type,
        adjustment_quantity: args.adjustmentQuantity,
        reason: args.notes,
        alert_min: ingredient.alert_min
      },
      timestamp: Date.now(),
    });
  },
});
