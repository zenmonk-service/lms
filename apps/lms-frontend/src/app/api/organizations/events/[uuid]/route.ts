import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const PUT = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const data = await request.json();
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await servicesAxiosInstance.put(
      `${BASE_URL}/organizations/events/${uuid}/`,
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

export const DELETE = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await servicesAxiosInstance.delete(
      `${BASE_URL}/organizations/events/${uuid}/`,
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
