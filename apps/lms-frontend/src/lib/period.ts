import { Period } from "@repo/common";

// Configured once, at module load, so every consumer sees the same
// timezone the backend uses (apps/lms-backend/lib/period.js reads the same
// TIMEZONE env var) — import Period from here, not directly from
// "@repo/common", so this always runs first.
Period.setTimezone(process.env.NEXT_PUBLIC_TIMEZONE ?? "Asia/Kolkata");

export { Period };
