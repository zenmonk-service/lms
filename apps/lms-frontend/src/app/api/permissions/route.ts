import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const org_uuid = request.headers.get("org_uuid");
  const { searchParams } = new URL(request.url);

  try {
    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/permissions`,
      {
        headers: {
          org_uuid: org_uuid,
        },
        params: Object.fromEntries(searchParams),
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
