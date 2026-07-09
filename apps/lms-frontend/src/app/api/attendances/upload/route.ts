import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;

  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const formData = await request.formData();

    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/attendances/upload`,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}
