import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const org_uuid = request.headers.get("org_uuid");

    const resp = await servicesAxiosInstance.get(
      `${BASE_URL}/organizations/settings`,
      {
        headers: {
          org_uuid: org_uuid,
        },
      },
    );

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    const org_uuid = request.headers.get("org_uuid");

    const resp = await servicesAxiosInstance.put(
      `${BASE_URL}/organizations/settings`,
      body,
      {
        headers: {
          org_uuid: org_uuid,
        },
      },
    );

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}
