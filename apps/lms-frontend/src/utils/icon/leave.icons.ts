import { LeaveRequestStatus } from "@/features/leave/leave.types";
import {
  Circle,
  CircleArrowOutUpRight,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { IconConfig } from "./get-icon";

export const LEAVE_ICONS = {
  [LeaveRequestStatus.PENDING]: {
    icon: Circle,
    className: "text-muted fill-background z-10",
    size: 18,
  },

  [LeaveRequestStatus.APPROVED]: {
    icon: CircleCheck,
    className: "fill-primary text-primary-foreground z-10",
    size: 18,
  },

  [LeaveRequestStatus.REJECTED]: {
    icon: CircleX,
    className: "fill-destructive text-primary-foreground z-10",
    size: 18,
  },

  [LeaveRequestStatus.RECOMMENDED]: {
    icon: CircleArrowOutUpRight,
    className: "text-muted fill-accent z-10",
    size: 18,
  },

  [LeaveRequestStatus.CANCELLED]: {
    icon: CircleX,
    className: "fill-destructive text-primary-foreground z-10",
    size: 18,
  },
} satisfies Record<string, IconConfig>;
