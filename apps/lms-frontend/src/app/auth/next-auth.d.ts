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
      permissions?: any[];
      org_uuid?: string;
      organization_shift?: Shift;
    };
  }

  interface User {
    uuid?: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: SessionRole | null;
    permissions?: any[];
    org_uuid?: string;
    organization_shift?: Shift;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
    image?: string | null;
    role?: SessionRole | null;
  }
}
