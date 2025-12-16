// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      uuid?: string;
      name?: string;
      email?: string;
      permissions?: any[];
      org_uuid?: string;
    };
  }

  interface User {
    uuid?: string;
    name?: string;
    email?: string;
    permissions?: any[];
    org_uuid?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
  }
}
