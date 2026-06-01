import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Normalize phone number for matching.
 * Removes spaces, dashes, and the leading "+".
 * "+34 632 202 351" → "34632202351"
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\+\(\)]/g, "");
}

/**
 * Login: find staff member by phone, link auth_id, return role + sections.
 * Called from the frontend after Whatauth authentication.
 *
 * Flow:
 * 1. First try to find by auth_id (returning user)
 * 2. If not found, try by phone number
 * 3. If found → link auth_id, return staff + role info
 * 4. If NOT found → return null (access denied)
 */
export const loginByPhone = mutation({
  args: {
    auth_id: v.string(),   // Whatauth subject e.g. "wa:34632202351"
    phone: v.string(),     // From JWT e.g. "+34632202351"
    name: v.string(),      // From JWT
  },
  handler: async (ctx, args) => {
    const normalizedPhone = normalizePhone(args.phone);

    // 1. Try to find by auth_id first (returning user, already linked)
    let staffMember = await ctx.db
      .query("staff")
      .withIndex("by_auth_id", (q) => q.eq("auth_id", args.auth_id))
      .first();

    // 2. If not found by auth_id, try by phone
    if (!staffMember) {
      // Fetch all staff and match by normalized phone
      // (phone format may differ: "+34632202351" vs "34632202351" vs "632202351")
      const allStaffWithPhone = await ctx.db
        .query("staff")
        .withIndex("by_phone")
        .take(200);

      staffMember = allStaffWithPhone.find((s) => {
        if (!s.phone) return false;
        return normalizePhone(s.phone) === normalizedPhone;
      }) ?? null;
    }

    if (!staffMember) {
      console.log(`[AUTH] No staff found for phone ${args.phone} or auth_id ${args.auth_id}`);
      return null; // Access denied — not a registered staff member
    }

    // 3. Check status
    if (staffMember.status !== "active") {
      console.log(`[AUTH] Staff ${staffMember.name} is ${staffMember.status}, access denied`);
      return { denied: true, reason: staffMember.status, staff: null, role: null, sections: null };
    }

    // 4. Link auth_id if not already linked
    if (staffMember.auth_id !== args.auth_id) {
      await ctx.db.patch(staffMember._id, {
        auth_id: args.auth_id,
      });
    }

    console.log("=== STAFF LOGIN ===");
    console.log("Staff:", JSON.stringify({
      _id: staffMember._id,
      name: staffMember.name,
      role: staffMember.role,
      phone: staffMember.phone,
      auth_id: args.auth_id,
      establishment_id: staffMember.establishment_id,
      dashboard_sections: staffMember.dashboard_sections,
      status: staffMember.status,
    }, null, 2));
    console.log("===================");

    return {
      denied: false,
      staff: {
        _id: staffMember._id,
        name: staffMember.name,
        last_name: staffMember.last_name,
        role: staffMember.role,
        phone: staffMember.phone,
        email: staffMember.email,
        photo_url: staffMember.photo_url,
        establishment_id: staffMember.establishment_id,
        dashboard_sections: staffMember.dashboard_sections,
        status: staffMember.status,
      },
      role: staffMember.role,
      sections: staffMember.dashboard_sections,
    };
  },
});

/**
 * Get current staff session by auth_id (reactive query).
 * Used to keep the frontend in sync with staff data changes.
 */
export const me = query({
  args: {
    auth_id: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.auth_id) return null;

    const staffMember = await ctx.db
      .query("staff")
      .withIndex("by_auth_id", (q) => q.eq("auth_id", args.auth_id))
      .first();

    if (!staffMember) return null;

    return {
      staff: {
        _id: staffMember._id,
        name: staffMember.name,
        last_name: staffMember.last_name,
        role: staffMember.role,
        phone: staffMember.phone,
        email: staffMember.email,
        photo_url: staffMember.photo_url,
        establishment_id: staffMember.establishment_id,
        dashboard_sections: staffMember.dashboard_sections,
        status: staffMember.status,
      },
      role: staffMember.role,
      sections: staffMember.dashboard_sections,
    };
  },
});
