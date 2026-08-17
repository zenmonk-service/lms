import { bffClient } from "@/config/client";

export const resetPassword = (payload: ResetPasswordPayload) => {
  return bffClient.post("/users/reset-password", payload);
};
