import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCustomer = mutation({
  args: {
    establishments_id: v.array(v.id("establishments")),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    points: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    preferred_payment_method: v.optional(v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"))),
    birth_date: v.optional(v.string()),
    anniversary: v.optional(v.string()),
    last_visit: v.optional(v.number()),
    total_visits: v.optional(v.number()),
    total_spent: v.optional(v.number()),
    average_ticket: v.optional(v.number()),
    preferred_table: v.optional(v.id("tables")),
    allergens: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("whatsapp"), v.literal("reservation")),
  },
  handler: async (ctx, args) => {
    const customerId = await ctx.db.insert("customers", {
      establishments_id: args.establishments_id,
      name: args.name,
      phone: args.phone,
      email: args.email,
      points: args.points || 0,
      tags: args.tags,
      preferred_payment_method: args.preferred_payment_method,
      birth_date: args.birth_date,
      anniversary: args.anniversary,
      last_visit: args.last_visit,
      total_visits: args.total_visits || 0,
      total_spent: args.total_spent || 0,
      average_ticket: args.average_ticket || 0,
      preferred_table: args.preferred_table,
      allergens: args.allergens || [],
      notes: args.notes,
      source: args.source,
      created_at: Date.now(),
    });

    return customerId;
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    points: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    preferred_payment_method: v.optional(v.union(v.literal("cash"), v.literal("card"), v.literal("bizum"))),
    birth_date: v.optional(v.string()),
    anniversary: v.optional(v.string()),
    last_visit: v.optional(v.number()),
    total_visits: v.optional(v.number()),
    total_spent: v.optional(v.number()),
    average_ticket: v.optional(v.number()),
    preferred_table: v.optional(v.id("tables")),
    allergens: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.points !== undefined) updateData.points = args.points;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.preferred_payment_method !== undefined) updateData.preferred_payment_method = args.preferred_payment_method;
    if (args.birth_date !== undefined) updateData.birth_date = args.birth_date;
    if (args.anniversary !== undefined) updateData.anniversary = args.anniversary;
    if (args.last_visit !== undefined) updateData.last_visit = args.last_visit;
    if (args.total_visits !== undefined) updateData.total_visits = args.total_visits;
    if (args.total_spent !== undefined) updateData.total_spent = args.total_spent;
    if (args.average_ticket !== undefined) updateData.average_ticket = args.average_ticket;
    if (args.preferred_table !== undefined) updateData.preferred_table = args.preferred_table;
    if (args.allergens !== undefined) updateData.allergens = args.allergens;
    if (args.notes !== undefined) updateData.notes = args.notes;

    await ctx.db.patch(args.customerId, updateData);

    return args.customerId;
  },
});

export const findCustomerByPhone = query({
  args: {
    establishment_id: v.id("establishments"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .collect();

    // Find customer by phone in the specified establishment
    const customer = customers.find(c => 
      c.phone === args.phone && 
      c.establishments_id.includes(args.establishment_id)
    );

    return customer || null;
  },
});

export const findCustomerByNameAndPhone = query({
  args: {
    establishment_id: v.id("establishments"),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .collect();

    // Find customer by name and phone in the specified establishment
    const customer = customers.find(c => 
      c.name === args.name && 
      c.establishments_id.includes(args.establishment_id) &&
      (!args.phone || c.phone === args.phone)
    );

    return customer || null;
  },
});

export const getCustomers = query({
  args: {
    establishment_id: v.id("establishments"),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .collect();

    // Filter customers by establishment
    return customers.filter(c => c.establishments_id.includes(args.establishment_id));
  },
});

export const searchCustomers = query({
  args: {
    establishment_id: v.id("establishments"),
    search_query: v.string(),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .collect();

    // Filter customers by establishment and search query
    const searchLower = args.search_query.toLowerCase();
    const searchNumbersOnly = args.search_query.replace(/\D/g, ''); // Remove non-digit characters
    
    const filteredCustomers = customers.filter(c => 
      c.establishments_id.includes(args.establishment_id) &&
      (
        c.name.toLowerCase().includes(searchLower) ||
        (c.phone && searchNumbersOnly && c.phone.replace(/\D/g, '').includes(searchNumbersOnly)) ||
        (c.email && c.email.toLowerCase().includes(searchLower))
      )
    );
    return filteredCustomers;
  },
});
