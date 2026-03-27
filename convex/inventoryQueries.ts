import { v } from "convex/values";
import { query } from "./_generated/server";

// Tipos para mejor tipado
interface StaffDocument {
  name: string;
  last_name?: string;
}

interface StockMovementWithStaff {
  _id: any;
  ingredient_id: any;
  establishment_id: any;
  type: "purchase" | "waste" | "adjustment" | "auto_deduction" | "sale" | "return";
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier?: string;
  notes?: string;
  staff_id?: any;
  timestamp: number;
  staffName: string;
}

/**
 * Obtener movimientos de stock de un ingrediente
 */
export const getStockMovements = query({
  args: { ingredientId: v.id("ingredients") },
  handler: async (ctx, args): Promise<StockMovementWithStaff[]> => {
    const movements = await ctx.db
      .query("stock_movements")
      .withIndex("by_ingredient_timestamp", (q) => q.eq("ingredient_id", args.ingredientId))
      .collect();

    // Ordenar por timestamp manualmente
    movements.sort((a, b) => b.timestamp - a.timestamp);

    // Obtener información del staff para cada movimiento
    const movementsWithStaff = await Promise.all(
      movements.map(async (movement) => {
        let staffName = "Sistema";
        if (movement.staff_id !== "system") {
          const staff = await ctx.db.get(movement.staff_id as any);
          if (staff) {
            staffName = `${(staff as any).name} ${(staff as any).last_name || ""}`.trim();
          } else {
            staffName = "Desconocido";
          }
        }

        return {
          ...movement,
          staffName,
          timestamp: movement.timestamp,
        };
      })
    );

    return movementsWithStaff;
  },
});

/**
 * Obtener movimientos filtrados por tipo
 */
export const getStockMovementsByType = query({
  args: { 
    ingredientId: v.id("ingredients"),
    type: v.union(
      v.literal("purchase"),
      v.literal("waste"),
      v.literal("adjustment"),
      v.literal("auto_deduction"),
      v.literal("sale"),
      v.literal("return")
    )
  },
  handler: async (ctx, args): Promise<StockMovementWithStaff[]> => {
    const movements = await ctx.db
      .query("stock_movements")
      .withIndex("by_ingredient_type", (q) => 
        q.eq("ingredient_id", args.ingredientId).eq("type", args.type)
      )
      .collect();

    // Ordenar por timestamp manualmente
    movements.sort((a, b) => b.timestamp - a.timestamp);

    // Obtener información del staff
    const movementsWithStaff = await Promise.all(
      movements.map(async (movement) => {
        let staffName = "Sistema";
        if (movement.staff_id !== "system") {
          const staff = await ctx.db.get(movement.staff_id as any);
          staffName = staff ? `${(staff as any).name} ${(staff as any).last_name || ""}`.trim() : "Desconocido";
        }

        return {
          ...movement,
          staffName,
        };
      })
    );

    return movementsWithStaff;
  },
});
