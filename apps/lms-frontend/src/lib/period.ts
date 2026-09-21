import { Period } from "@repo/common";

Period.setTimezone(
  process.env.NEXT_PUBLIC_TIMEZONE ?? "Asia/Kolkata"
);

export { Period };