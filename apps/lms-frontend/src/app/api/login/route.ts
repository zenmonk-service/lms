import { servicesAxiosInstance } from "@/config/axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_SSO_URL;
  const data = await request.json();
  try {
    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/login`,
      data,
    );
    const cookieStore = await cookies();
    cookieStore.set("access_token", response.data.data.token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    cookieStore.set("refresh_token", response.data.data.token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.message },
      { status: error.status },
    );
  }
};
