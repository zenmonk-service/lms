import { bffClient } from "@/config/client";

export const isResetLinkValid = (uid: string) => {
  return bffClient.get(`/users/reset-password`, {
    params: { uid  },
  });
};
