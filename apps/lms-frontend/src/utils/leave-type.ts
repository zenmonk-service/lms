import { LeaveType } from "@/features/leave/leave.types";

export const getPolicyMode = (leave: LeaveType) => {
  if (leave.is_sandwich_enabled && leave.is_clubbing_enabled) return "Sandwich & Club";
  if (leave.is_sandwich_enabled) return "Sandwich";
  if (leave.is_clubbing_enabled) return "Club";
  return "Standard";
};

export const getApplicableForLabels = (leave: LeaveType) => [
  ...leave.roles.map((role) => role.name),
  ...leave.users.map((user) => user.name),
];