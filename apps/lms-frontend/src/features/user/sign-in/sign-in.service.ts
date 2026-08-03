import { bffClient } from "@/config/client";
import { SignInInterface } from "./sign-in.types";

export const signIn = async (signInfo?: SignInInterface) => {
   const response = await bffClient.post("/login", signInfo);
  return response.json()
};
