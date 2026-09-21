import {Period} from "../../../../packages/common/dist/period"

Period.setTimezone(process.env.NEXT_PUBLIC_TIMEZONE ?? "Asia/Kolkata");

export { Period };
