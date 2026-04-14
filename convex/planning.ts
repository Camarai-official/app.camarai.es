import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const DAYS_ABBR = ["D", "L", "M", "X", "J", "V", "S"];

interface ParsedRange {
  startDayNum: number;
  endDayNum: number;
  openTime: string;
  closeTime: string;
}

function parseWorkingHours(workingHours: string): ParsedRange[] {
  if (!workingHours) return [];

  try {
    const parts = workingHours.split(",").map((s) => s.trim());
    return parts
      .filter((p) => p.includes(":"))
      .map((part) => {
        const colonIndex = part.indexOf(":");
        if (colonIndex === -1) return null;

        const daysPart = part.substring(0, colonIndex).trim();
        const timesPart = part.substring(colonIndex + 1).trim();

        const [startDay, endDay] = daysPart.split("-").map((s) => s.trim());
        const [openTimeRaw, closeTimeRaw] = (timesPart || "").split("-").map((s) => s.trim());

        const getDayNum = (abbr: string) => {
          const index = DAYS_ABBR.indexOf(abbr);
          return index === -1 ? 1 : index; // Default to Monday if not found
        };

        return {
          startDayNum: getDayNum(startDay),
          endDayNum: getDayNum(endDay || startDay),
          openTime: openTimeRaw || "00:00",
          closeTime: closeTimeRaw || "00:00",
        };
      })
      .filter((r): r is ParsedRange => r !== null);
  } catch (e) {
    console.error("Error parsing working hours:", e);
    return [];
  }
}

function isDayInRange(dayNum: number, startDayNum: number, endDayNum: number): boolean {
  if (startDayNum <= endDayNum) {
    return dayNum >= startDayNum && dayNum <= endDayNum;
  } else {
    // Case like S-M (Saturday to Monday: 6, 0, 1)
    return dayNum >= startDayNum || dayNum <= endDayNum;
  }
}

export const getPlanningByDateRange = query({
  args: {
    establishmentId: v.id("establishments"),
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.string(),   // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("staff_planning")
      .withIndex("by_establishment_date", (q) =>
        q.eq("establishment_id", args.establishmentId)
         .gte("date", args.startDate)
         .lte("date", args.endDate)
      )
      .collect();
  },
});

export const upsertPlanningEntry = mutation({
  args: {
    id: v.optional(v.id("staff_planning")),
    staffId: v.id("staff"),
    establishmentId: v.id("establishments"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    isCustom: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      await ctx.db.patch(args.id, {
        start_time: args.startTime,
        end_time: args.endTime,
        is_custom: args.isCustom,
        notes: args.notes,
      });
      return args.id;
    }

    // Fallback search by staff and date only if no ID is provided
    // and we want to ensure we don't duplicate on first creation
    // However, for multi-shift, we might actually WANT to allow multiple inserts.
    // Let's check if the specific combination of staff/date/startTime/endTime exists? 
    // Usually, if id is missing it's a NEW entry.
    return await ctx.db.insert("staff_planning", {
      staff_id: args.staffId,
      establishment_id: args.establishmentId,
      date: args.date,
      start_time: args.startTime,
      end_time: args.endTime,
      is_custom: args.isCustom,
      notes: args.notes,
    });
  },
});

export const generateMonthlyPlanning = mutation({
  args: {
    establishmentId: v.id("establishments"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_establishment", (q) => q.eq("establishment_id", args.establishmentId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const daysInMonth = new Date(args.year, args.month, 0).getDate();
    const startDate = `${args.year}-${String(args.month).padStart(2, "0")}-01`;
    const endDate = `${args.year}-${String(args.month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    // 1. Delete all existing non-custom planning for this month to start fresh
    // but keep manual changes (is_custom: true).
    const existingPlanning = await ctx.db
      .query("staff_planning")
      .withIndex("by_establishment_date", (q) => 
        q.eq("establishment_id", args.establishmentId)
         .gte("date", startDate)
         .lte("date", endDate)
      )
      .collect();

    for (const p of existingPlanning) {
      if (!p.is_custom) {
        await ctx.db.delete(p._id);
      }
    }

    // 2. Map custom ones to avoid overwriting them
    const customEntriesMap = new Map();
    existingPlanning.filter(p => p.is_custom).forEach(p => {
      customEntriesMap.set(`${p.staff_id}_${p.date}`, p);
    });

    const entriesToCreate = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${args.year}-${String(args.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(args.year, args.month - 1, day);
      const dayNum = dateObj.getDay(); // 0 is Sunday, 1 is Monday...

      for (const member of staff) {
        // If there's already a custom entry for this day, we NEVER auto-fill it
        if (customEntriesMap.has(`${member._id}_${dateStr}`)) continue;

        const ranges = parseWorkingHours(member.working_hours || "");
        for (const range of ranges) {
          if (isDayInRange(dayNum, range.startDayNum, range.endDayNum)) {
             await ctx.db.insert("staff_planning", {
                staff_id: member._id,
                establishment_id: args.establishmentId,
                date: dateStr,
                start_time: range.openTime,
                end_time: range.closeTime,
                is_custom: false,
            });
          }
        }
      }
    }

    return { success: true };
  },
});

export const deletePlanningEntry = mutation({
  args: { id: v.id("staff_planning") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
