import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const url = new URL(request.url);
    const params: Record<string, string | string[]> = {};
    url.searchParams.forEach((v, k) => {
      params[k] = v;
    });

    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/organizations/events`,
      {
        headers: {
          org_uuid: org_uuid,
        },
        params,
      },
    );

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

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const data = await request.json();
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/organizations/events`,
      data,
      {
        headers: {
          org_uuid: org_uuid,
        },
      },
    );

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
