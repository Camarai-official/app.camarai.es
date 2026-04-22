import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries para Staff

export const getStaffByEstablishment = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    return staff.map(member => {
      const mappedData = {
        id: member._id,
        nombre: member.name,
        email: member.email || "",
        rol: member.role,
        estado: member.status === "active" ? "Activo" : member.status === "inactive" ? "Inactivo" : member.status === "on_leave" ? "Vacaciones" : member.status === "sick_leave" ? "Baja" : "Activo",
        pin: member.pin || "",
        telefono: member.phone || "",
        fotoUrl: member.photo_url || "",
        horasContratadas: member.contracted_hours || 40,
        salarioPorHora: member.hourly_rate ? member.hourly_rate / 100 : 12,
        fecha_contratacion: new Date(member.contract_start).toLocaleDateString(),
        // Campos adicionales del schema
        last_name: member.last_name,
        auth_id: member.auth_id,
        contract_type: member.contract_type,
        contract_end: member.contract_end,
        salary: member.salary,
        iban: member.iban,
        irpf: member.irpf,
        ss_number: member.ss_number,
        break_duration_minutes: member.break_duration_minutes,
        max_late_minutes: member.max_late_minutes,
        dashboard_sections: member.dashboard_sections,
        clock_methods: member.clock_methods,
        documents: member.documents,
        notes: member.notes,
        departamento: member.departamento || "", // Campo departamento
        working_hours: member.working_hours || "", // Horario laboral
        color: member.color, // Color de identidad visual
        icon: member.icon, // Icono de representación
        created_at: member.created_at,
      };
      return mappedData;
    });
  },
});

export const getStaffMemberById = query({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff) return null;

    return {
      id: staff._id,
      nombre: staff.name,
      email: staff.email || "",
      rol: staff.role,
      estado: staff.status === "active" ? "Activo" : "Inactivo",
      pin: staff.pin || "",
      telefono: staff.phone || "",
      fotoUrl: staff.photo_url || "",
      horasContratadas: staff.contracted_hours || 40,
      salarioPorHora: staff.hourly_rate ? staff.hourly_rate / 100 : 12,
      fecha_contratacion: new Date(staff.contract_start).toLocaleDateString(),
      last_name: staff.last_name,
      auth_id: staff.auth_id,
      contract_type: staff.contract_type,
      contract_end: staff.contract_end,
      salary: staff.salary,
      iban: staff.iban,
      irpf: staff.irpf,
      ss_number: staff.ss_number,
      break_duration_minutes: staff.break_duration_minutes,
      max_late_minutes: staff.max_late_minutes,
      dashboard_sections: staff.dashboard_sections,
      clock_methods: staff.clock_methods,
      documents: staff.documents,
      notes: staff.notes,
      departamento: staff.departamento,
      working_hours: staff.working_hours,
      color: staff.color, // Color de identidad visual
      icon: staff.icon, // Icono de representación
      created_at: staff.created_at,
    };
  },
});

// Queries para Time Logs
export const getTimeLogsByEstablishment = query({
  args: {
    establishmentId: v.id("establishments"),
    limit: v.optional(v.number()),
    staffId: v.optional(v.id("staff")),
    action: v.optional(v.union(
      v.literal("clock_in"),
      v.literal("clock_out"),
      v.literal("break_start"),
      v.literal("break_end")
    ))
  },
  handler: async (ctx, args) => {
    // Obtener todos los logs del establecimiento
    const allLogs = await ctx.db
      .query("time_logs")
      .collect();

    // Filtrar por establecimiento
    let filteredLogs = allLogs.filter(log => log.establishment_id === args.establishmentId);

    // Filtrar por staffId si se proporciona
    if (args.staffId) {
      filteredLogs = filteredLogs.filter(log => log.staff_id === args.staffId);
    }

    // Filtrar por acción si se proporciona
    if (args.action) {
      filteredLogs = filteredLogs.filter(log => log.action === args.action);
    }

    // Ordenar por timestamp descendente y aplicar límite
    const sortedLogs = filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    const limitedLogs = args.limit ? sortedLogs.slice(0, args.limit) : sortedLogs;

    return limitedLogs.map(log => ({
      id: log._id,
      staffId: log.staff_id,
      timestamp: new Date(log.timestamp).toISOString(),
      action: log.action,
      method: log.method,
      device_id: log.device_id,
      location: log.location,
      modified_by: log.modified_by,
      notes: log.notes,
    }));
  },
});

// Queries para Absence Requests
export const getAbsenceRequestsByEstablishment = query({
  args: {
    establishmentId: v.id("establishments"),
    staffId: v.optional(v.id("staff"))
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("absence_requests")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId));

    const requests = await query.collect();

    // Filtrar por staffId si se proporciona
    let filteredRequests = requests;
    if (args.staffId) {
      filteredRequests = requests.filter(req => req.staff_id === args.staffId);
    }

    return filteredRequests.map(req => ({
      id: req._id,
      staffId: req.staff_id,
      type: req.type,
      startDate: req.start_date,
      endDate: req.end_date,
      total_days: req.total_days,
      reason: req.reason,
      document: req.document,
      status: req.status,
      reviewed_by: req.reviewed_by,
      reviewed_at: req.reviewed_at,
      created_at: req.created_at,
    }));
  },
});

// Mutations para Staff
export const createStaffMember = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    last_name: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("cook"),
      v.literal("bartender"),
      v.literal("host")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    pin: v.optional(v.string()),
    photo_url: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("on_leave"), v.literal("sick_leave")),
    contract_type: v.union(v.literal("indefinite"), v.literal("temporary"), v.literal("practices"), v.literal("freelance")),
    contract_start: v.number(),
    contract_end: v.optional(v.number()),
    salary: v.number(), // In cents
    hourly_rate: v.optional(v.number()), // In cents
    contracted_hours: v.optional(v.number()),
    iban: v.optional(v.string()),
    irpf: v.number(),
    ss_number: v.optional(v.string()),
    break_duration_minutes: v.optional(v.number()),
    max_late_minutes: v.optional(v.number()),
    dashboard_sections: v.optional(v.array(v.string())),
    clock_methods: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
      uploadDate: v.number(),
    }))),
    notes: v.optional(v.string()),
    departamento: v.optional(v.string()), // Nuevo campo
    working_hours: v.optional(v.string()), // Horario laboral
    color: v.optional(v.string()), // Color de identidad visual
    icon: v.optional(v.string()), // Icono de representación
  },
  handler: async (ctx, args) => {
    const staffId = await ctx.db.insert("staff", {
      establishment_id: args.establishmentId,
      name: args.name,
      last_name: args.last_name,
      role: args.role,
      email: args.email,
      phone: args.phone,
      pin: args.pin,
      photo_url: args.photo_url,
      status: args.status,
      contract_type: args.contract_type,
      contract_start: args.contract_start,
      contract_end: args.contract_end,
      salary: args.salary,
      hourly_rate: args.hourly_rate,
      contracted_hours: args.contracted_hours,
      iban: args.iban,
      irpf: args.irpf,
      ss_number: args.ss_number,
      break_duration_minutes: args.break_duration_minutes,
      max_late_minutes: args.max_late_minutes,
      dashboard_sections: args.dashboard_sections || [],
      clock_methods: args.clock_methods || [],
      documents: args.documents,
      notes: args.notes,
      departamento: args.departamento, // Nuevo campo
      working_hours: args.working_hours, // Horario laboral (custom)
      color: args.color, // Color de identidad visual
      icon: args.icon, // Icono de representación
      created_at: Date.now(),
    });

    return staffId;
  },
});

export const updateStaffMember = mutation({
  args: {
    staffId: v.id("staff"),
    name: v.string(),
    last_name: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("cook"),
      v.literal("bartender"),
      v.literal("host")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    pin: v.optional(v.string()),
    photo_url: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("on_leave"), v.literal("sick_leave")),
    contract_type: v.union(v.literal("indefinite"), v.literal("temporary"), v.literal("practices"), v.literal("freelance")),
    contract_start: v.number(),
    contract_end: v.optional(v.number()),
    salary: v.number(), // In cents
    hourly_rate: v.optional(v.number()), // In cents
    contracted_hours: v.optional(v.number()),
    iban: v.optional(v.string()),
    irpf: v.number(),
    ss_number: v.optional(v.string()),
    break_duration_minutes: v.optional(v.number()),
    max_late_minutes: v.optional(v.number()),
    dashboard_sections: v.optional(v.array(v.string())),
    clock_methods: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
      uploadDate: v.number(),
    }))),
    notes: v.optional(v.string()),
    departamento: v.optional(v.string()), // Nuevo campo
    working_hours: v.optional(v.string()), // Horario laboral
    color: v.optional(v.string()), // Color de identidad visual
    icon: v.optional(v.string()), // Icono de representación
  },
  handler: async (ctx, args) => {
    const { staffId, ...updateData } = args;

    await ctx.db.patch(staffId, {
      name: updateData.name,
      last_name: updateData.last_name,
      role: updateData.role,
      email: updateData.email,
      phone: updateData.phone,
      pin: updateData.pin,
      photo_url: updateData.photo_url,
      status: updateData.status,
      contract_type: updateData.contract_type,
      contract_start: updateData.contract_start,
      contract_end: updateData.contract_end,
      salary: updateData.salary,
      hourly_rate: updateData.hourly_rate,
      contracted_hours: updateData.contracted_hours,
      iban: updateData.iban,
      irpf: updateData.irpf,
      ss_number: updateData.ss_number,
      break_duration_minutes: updateData.break_duration_minutes,
      max_late_minutes: updateData.max_late_minutes,
      dashboard_sections: updateData.dashboard_sections,
      clock_methods: updateData.clock_methods,
      documents: updateData.documents,
      notes: updateData.notes,
      departamento: updateData.departamento,
      working_hours: updateData.working_hours,
      color: updateData.color, // Color de identidad visual
      icon: updateData.icon, // Icono de representación
    });

    return staffId;
  },
});

export const deleteStaffMember = mutation({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.staffId);
  },
});

// Mutations para Time Logs
export const createTimeLog = mutation({
  args: {
    establishmentId: v.id("establishments"),
    staffId: v.id("staff"),
    action: v.union(v.literal("clock_in"), v.literal("clock_out"), v.literal("break_start"), v.literal("break_end")),
    method: v.union(v.literal("app"), v.literal("whatsapp"), v.literal("qr"), v.literal("web"), v.literal("manual")),
    deviceId: v.optional(v.id("clock_devices")),
    location: v.optional(v.string()),
    modified_by: v.optional(v.id("staff")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get staff details for event log
    const staff = await ctx.db.get(args.staffId);
    const staffName = staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Empleado";

    // Create time log
    const logId = await ctx.db.insert("time_logs", {
      establishment_id: args.establishmentId,
      staff_id: args.staffId,
      action: args.action,
      timestamp: Date.now(),
      method: args.method,
      device_id: args.deviceId,
      location: args.location,
      modified_by: args.modified_by,
      notes: args.notes,
    });

    // Create event log entry
    let eventDescription = "";
    let eventLevel: "info" | "warning" | "critical" = "info";

    switch (args.action) {
      case "clock_in":
        eventDescription = `Inició turno en ${args.location || "establecimiento"}`;
        break;
      case "clock_out":
        eventDescription = `Finalizó turno`;
        break;
      case "break_start":
        eventDescription = `Inició descanso`;
        break;
      case "break_end":
        eventDescription = `Terminó descanso`;
        break;
    }

    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: eventLevel,
      actor: args.staffId,
      action: `${args.action === "clock_in" ? "Check-in" : args.action === "clock_out" ? "Check-out" : args.action === "break_start" ? "Inicio Descanso" : "Vuelta de Descanso"} Personal`,
      entity_type: "time_log",
      entity_id: logId,
      after: {
        action: args.action,
        method: args.method,
        location: args.location,
        staff_name: staffName
      },
      timestamp: Date.now(),
    });

    return logId;
  },
});

export const updateTimeLog = mutation({
  args: {
    logId: v.id("time_logs"),
    action: v.union(v.literal("clock_in"), v.literal("clock_out"), v.literal("break_start"), v.literal("break_end")),
    timestamp: v.number(),
    method: v.union(v.literal("app"), v.literal("whatsapp"), v.literal("qr"), v.literal("web"), v.literal("manual")),
    location: v.optional(v.string()),
    modified_by: v.optional(v.id("staff")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      action: args.action,
      timestamp: args.timestamp,
      method: args.method,
      location: args.location,
      modified_by: args.modified_by,
      notes: args.notes,
    });

    return args.logId;
  },
});

export const deleteTimeLog = mutation({
  args: { logId: v.id("time_logs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.logId);
  },
});

// Mutations para Absence Requests
export const createAbsenceRequest = mutation({
  args: {
    establishmentId: v.id("establishments"),
    staffId: v.id("staff"),
    type: v.union(v.literal("vacation"), v.literal("sick_leave"), v.literal("personal_days"), v.literal("other")),
    startDate: v.string(),
    endDate: v.string(),
    total_days: v.number(),
    reason: v.optional(v.string()),
    document: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get staff details for event log
    const staff = await ctx.db.get(args.staffId);
    const staffName = staff ? `${staff.name} ${staff.last_name || ""}`.trim() : "Empleado";

    // Create absence request
    const requestId = await ctx.db.insert("absence_requests", {
      staff_id: args.staffId,
      establishment_id: args.establishmentId,
      type: args.type,
      start_date: args.startDate,
      end_date: args.endDate,
      total_days: args.total_days,
      reason: args.reason,
      document: args.document,
      status: "pending",
      created_at: Date.now(),
    });

    // Create event log entry
    await ctx.db.insert("event_log", {
      establishment_id: args.establishmentId,
      type: "operational",
      level: "warning",
      actor: args.staffId,
      action: "Solicitud Ausencia",
      entity_type: "absence_request",
      entity_id: requestId,
      after: {
        type: args.type,
        start_date: args.startDate,
        end_date: args.endDate,
        total_days: args.total_days,
        reason: args.reason,
        document: args.document,
        staff_name: staffName
      },
      timestamp: Date.now(),
    });

    return requestId;
  },
});

export const updateAbsenceRequestStatus = mutation({
  args: {
    requestId: v.id("absence_requests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewed_by: v.id("staff")
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      reviewed_by: args.reviewed_by,
      reviewed_at: Date.now(),
    });

    return args.requestId;
  },
});

// Queries para Incidencias
export const getClockIncidentsByEstablishment = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const incidents = await ctx.db
      .query("clock_incidents")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    return incidents.map(incident => ({
      id: incident._id,
      staffId: incident.staff_id,
      tipo: incident.type,
      fecha: new Date(incident.detected_at).toLocaleDateString(),
      hora: new Date(incident.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      motivo: incident.description,
      estado: incident.status,
      created_at: incident._creationTime,
    }));
  },
});

export const createClockIncident = mutation({
  args: {
    establishmentId: v.id("establishments"),
    staffId: v.id("staff"),
    type: v.union(v.literal("no_clock_out"), v.literal("duplicate"), v.literal("late_clock_in"), v.literal("suspicious")),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const incidentId = await ctx.db.insert("clock_incidents", {
      staff_id: args.staffId,
      establishment_id: args.establishmentId,
      type: args.type,
      description: args.description,
      status: "open",
      detected_at: Date.now(),
    });

    return incidentId;
  },
});

export const updateClockIncidentStatus = mutation({
  args: {
    incidentId: v.id("clock_incidents"),
    status: v.union(v.literal("open"), v.literal("justified"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      status: args.status,
    });

    return args.incidentId;
  },
});

// Queries para Dispositivos
export const getClockDevicesByEstablishment = query({
  args: { establishmentId: v.id("establishments") },
  handler: async (ctx, args) => {
    const devices = await ctx.db
      .query("clock_devices")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .collect();

    return devices.map(device => ({
      id: device._id,
      nombre: device.name,
      tipo: device.type,
      ubicacion: device.location,
      estado: device.status,
      token: device.token,
      last_seen: device.last_seen,
      created_at: device._creationTime,
    }));
  },
});

export const createClockDevice = mutation({
  args: {
    establishmentId: v.id("establishments"),
    name: v.string(),
    type: v.union(v.literal("tablet"), v.literal("terminal"), v.literal("smartphone")),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deviceId = await ctx.db.insert("clock_devices", {
      establishment_id: args.establishmentId,
      name: args.name,
      type: args.type,
      location: args.location,
      status: "offline",
      token: Math.random().toString(36).substring(2, 15),
      last_seen: Date.now(),
      created_at: Date.now(),
    });

    return deviceId;
  },
});

export const updateClockDevice = mutation({
  args: {
    deviceId: v.id("clock_devices"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("tablet"), v.literal("terminal"), v.literal("smartphone"))),
    location: v.optional(v.string()),
    status: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("maintenance"))),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.deviceId, updateData);

    return args.deviceId;
  },
});

export const deleteClockDevice = mutation({
  args: { deviceId: v.id("clock_devices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.deviceId);
    return args.deviceId;
  },
});

