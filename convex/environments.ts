import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries para Environments

export const getFirstEstablishment = query({
  args: {},
  handler: async (ctx) => {
    // Obtener el primer establecimiento disponible
    const establishment = await ctx.db.query("establishments").first();
    return establishment;
  },
});

export const getEnvironmentsByEstablishment = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const environments = await ctx.db
      .query("environments")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    // Para cada environment, obtener sus tablas
    const environmentsWithTables = await Promise.all(
      environments.map(async (env) => {
        const tables = await ctx.db
          .query("tables")
          .withIndex("by_environment", (q) => q.eq("environment_id", env._id))
          .collect();

        // Mapear status de Convex a UI
        const statusMapping = {
          active: "Abierto",
          inactive: "Cerrado",
          maintenance: "Cerrado",
        } as const;

        const tableStatusMapping = {
          free: "Libre",
          occupied: "Ocupada",
          reserved: "Reservada",
          dirty: "Mantenimiento",
        } as const;

        return {
          id: env._id,
          name: env.name,
          description: env.description,
          capacity: env.capacity,
          status: statusMapping[env.status] || "Cerrado",
          order: env.order,
          icon: env.icon || "Building",
          color: env.color || "#9B6EFD",
          created_at: env.created_at,
          tables: tables.map((table) => ({
            id: table._id,
            number: table.number,
            label: table.label,
            capacity: table.capacity,
            status: tableStatusMapping[table.status] || "Libre",
            current_order_id: table.current_order_id,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape,
            chairs: table.chairs,
            is_object: table.is_object,
            object_type: table.object_type,
          })),
        };
      })
    );

    return environmentsWithTables;
  },
});

export const getTablesByEnvironment = query({
  args: { environmentId: v.id("environments") },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_environment", (q) => q.eq("environment_id", args.environmentId))
      .collect();

    const tableStatusMapping = {
      free: "Libre",
      occupied: "Ocupada",
      reserved: "Reservada",
      dirty: "Mantenimiento",
    } as const;

    return tables.map((table) => ({
      id: table._id,
      number: table.number,
      label: table.label,
      capacity: table.capacity,
      status: tableStatusMapping[table.status] || "Libre",
      current_order_id: table.current_order_id,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      rotation: table.rotation,
      shape: table.shape,
      chairs: table.chairs,
      is_object: table.is_object,
      object_type: table.object_type,
    }));
  },
});

// Mutations para Environments

export const createEnvironment = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("maintenance"))),
    order: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const environmentId = await ctx.db.insert("environments", {
      establishment_id: args.establishmentId,
      name: args.name,
      description: args.description,
      capacity: args.capacity || 0,
      status: args.status || "active",
      order: args.order || 0,
      icon: args.icon || "Building",
      color: args.color || "#9B6EFD",
      created_at: Date.now(),
    });

    return environmentId;
  },
});

export const updateEnvironment = mutation({
  args: {
    environmentId: v.id("environments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("maintenance"))),
    order: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { environmentId, ...updateData } = args;

    const updates: any = {};
    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.capacity !== undefined) updates.capacity = updateData.capacity;
    if (updateData.status !== undefined) updates.status = updateData.status;
    if (updateData.order !== undefined) updates.order = updateData.order;
    if (updateData.icon !== undefined) updates.icon = updateData.icon;
    if (updateData.color !== undefined) updates.color = updateData.color;

    await ctx.db.patch(environmentId, updates);

    return environmentId;
  },
});

export const deleteEnvironment = mutation({
  args: { environmentId: v.id("environments") },
  handler: async (ctx, args) => {
    // Primero eliminar todas las tablas asociadas
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_environment", (q) => q.eq("environment_id", args.environmentId))
      .collect();

    for (const table of tables) {
      await ctx.db.delete(table._id);
    }

    // Luego eliminar el environment
    await ctx.db.delete(args.environmentId);

    return args.environmentId;
  },
});

// Mutations para Tables

export const createTable = mutation({
  args: {
    environmentId: v.id("environments"),
    number: v.number(),
    label: v.optional(v.string()),
    capacity: v.number(),
    status: v.optional(v.union(v.literal("free"), v.literal("occupied"), v.literal("reserved"), v.literal("dirty"))),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    rotation: v.optional(v.number()),
    shape: v.optional(v.union(v.literal("rectangle"), v.literal("circle"), v.literal("square"))),
    chairs: v.optional(v.any()),
    is_object: v.optional(v.boolean()),
    object_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tableId = await ctx.db.insert("tables", {
      environment_id: args.environmentId,
      number: args.number,
      label: args.label,
      capacity: args.capacity,
      status: args.status || "free",
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      rotation: args.rotation || 0,
      shape: args.shape || "rectangle",
      chairs: args.chairs,
      is_object: args.is_object,
      object_type: args.object_type,
    });

    return tableId;
  },
});

export const updateTable = mutation({
  args: {
    tableId: v.id("tables"),
    number: v.optional(v.number()),
    label: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.optional(v.union(v.literal("free"), v.literal("occupied"), v.literal("reserved"), v.literal("dirty"))),
    current_order_id: v.optional(v.id("orders")),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    rotation: v.optional(v.number()),
    shape: v.optional(v.union(v.literal("rectangle"), v.literal("circle"), v.literal("square"))),
    chairs: v.optional(v.any()),
    is_object: v.optional(v.boolean()),
    object_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tableId, ...updateData } = args;

    const updates: any = {};
    if (updateData.number !== undefined) updates.number = updateData.number;
    if (updateData.label !== undefined) updates.label = updateData.label;
    if (updateData.capacity !== undefined) updates.capacity = updateData.capacity;
    if (updateData.status !== undefined) updates.status = updateData.status;
    if (updateData.current_order_id !== undefined) updates.current_order_id = updateData.current_order_id;
    if (updateData.x !== undefined) updates.x = updateData.x;
    if (updateData.y !== undefined) updates.y = updateData.y;
    if (updateData.width !== undefined) updates.width = updateData.width;
    if (updateData.height !== undefined) updates.height = updateData.height;
    if (updateData.rotation !== undefined) updates.rotation = updateData.rotation;
    if (updateData.shape !== undefined) updates.shape = updateData.shape;
    if (updateData.chairs !== undefined) updates.chairs = updateData.chairs;
    if (updateData.is_object !== undefined) updates.is_object = updateData.is_object;
    if (updateData.object_type !== undefined) updates.object_type = updateData.object_type;

    await ctx.db.patch(tableId, updates);

    return tableId;
  },
});

export const deleteTable = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tableId);
    return args.tableId;
  },
});
