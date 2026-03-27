import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

/**
 * Generates a verification code (OTP)
 * Equivalent to verification insertion logic in SQL
 */
export const generateOTP = mutation({
  args: { 
    phoneNumber: v.optional(v.string()), 
    email: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    
    const otpId = await ctx.db.insert("verification_codes", {
      code,
      phone_number: args.phoneNumber,
      email: args.email,
      status: "pending",
      expires_at: Date.now() + (4 * 60 * 1000), // Expires in 4 mins
      created_at: Date.now(),
    });

    return { otpId, code };
  },
});

/**
 * Cleanup expired codes
 * Equivalent to delete_expired_verification_codes trigger in SQL
 */
export const cleanupOTP = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("verification_codes")
      .collect();

    for (const doc of expired) {
      if (doc.expires_at < now || doc.status === "verified") {
        await ctx.db.delete(doc._id);
      }
    }
  },
});
