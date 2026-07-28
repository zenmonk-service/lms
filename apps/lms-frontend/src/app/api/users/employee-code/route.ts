import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
  const { searchParams } = new URL(request.url);
    const response = await servicesAxiosInstance.get(`${BASE_URL}/users/employee-code`, {
      params: Object.fromEntries(searchParams),
      headers: {
        org_uuid: request.headers.get("org_uuid"),
      },
    });
    return NextResponse.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
};
