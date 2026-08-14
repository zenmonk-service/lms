import { bffClient } from "@/config/client";

export const forgotPassword = async (email: string) => {
   return await bffClient.post("/forgot-password", { email })
};
