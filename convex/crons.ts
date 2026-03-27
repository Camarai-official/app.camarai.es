import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup OTP codes every 5 minutes
crons.interval(
  "Cleanup expired OTP codes",
  { minutes: 5 },
  internal.auth.cleanupOTP
);

export default crons;
