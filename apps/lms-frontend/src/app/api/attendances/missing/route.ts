import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/attendances/missing`,
      {
        params: Object.fromEntries(new URL(request.url).searchParams),
        headers: {
          org_uuid: request.headers.get("org_uuid"),
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

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const org_uuid = request.headers.get("org_uuid");
    const data = await request.json();
    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/attendances/missing`,
      data,
      { headers: { org_uuid } },
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
