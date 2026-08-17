// next-auth.d.ts
import { Shift } from "@/features/shift/shift.slice";
import NextAuth, { DefaultSession } from "next-auth";

type SessionRole = {
  id?: string;
  uuid?: string;
  name?: string;
  description?: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      uuid?: string;
      name?: string;
      email?: string;
      image?: string | null;
      role?: SessionRole | null;
      org_uuid?: string;
    };
  }

  interface User {
    uuid?: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: SessionRole | null;
    org_uuid?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
    image?: string | null;
    role?: SessionRole | null;
  }
}
