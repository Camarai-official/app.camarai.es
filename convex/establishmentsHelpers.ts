import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getEstablishmentByLocalId = query({
  args: {
    localId: v.string(),
  },
  handler: async (ctx, args) => {
    // Obtener todos los establecimientos y ordenarlos por fecha de creación (el más reciente primero)
    const establishments = await ctx.db
      .query("establishments")
      .order("desc")
      .collect();
    
    // Devolver el establecimiento más reciente
    // TODO: Implementar mapeo proper entre IDs locales y IDs de Convex
    return establishments[0] || null;
  },
});

export const createEstablishmentFromLocal = mutation({
  args: {
    localId: v.string(),
  },
  handler: async (ctx, args) => {
    // Esta función debería crear un establecimiento en Convex basado en el ID local
    // Por ahora, vamos a devolver el primer establecimiento existente
    const establishments = await ctx.db
      .query("establishments")
      .collect();
    
    if (establishments.length === 0) {
      // Primero verificar si hay una compañía, si no, crear una
      const companies = await ctx.db.query("companies").collect();
      let companyId;
      
      if (companies.length === 0) {
        companyId = await ctx.db.insert("companies", {
          name: "Camarai Group",
          legal_name: "Camarai Group SL",
          nif: "B12345678",
          email: "contacto@camarai-central.es",
          country: "España",
          plan_id: "" as Id<"subscription_plans">, // Esto necesitará un plan válido
          plan_start_date: Date.now(),
          status: "active",
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      } else {
        companyId = companies[0]._id;
      }
      
      // Si no hay establecimientos, crear uno básico
      const newId = await ctx.db.insert("establishments", {
        company_id: companyId,
        name: "Camarai.es",
        legal_name: "Camarai Restaurant SL",
        cif: "B12345678",
        owner_id: "system",
        plan: "free",
        currency: "EUR",
        timezone: "Europe/Madrid",
        status: "active",
        email: "contacto@camarai-central.es",
        city: "Madrid",
        postal_code: "28080",
        country: "España",
        created_at: Date.now(),
      });
      
      return await ctx.db.get(newId);
    }
    
    return establishments[0];
  },
});
