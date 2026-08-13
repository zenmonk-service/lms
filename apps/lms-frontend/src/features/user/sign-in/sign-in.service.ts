import { bffClient } from "@/config/client";
import { SignInInterface } from "./sign-in.types";

export const signIn = async (signInfo?: SignInInterface) => {
   return  await bffClient.post("/login", signInfo)
};
