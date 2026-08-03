import { bffClient } from "@/config/client";

export const isUserExist = (email: string) => {
  return bffClient.get(`/users/exists`, {
    params: { email },
  });
};
