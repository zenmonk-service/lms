import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const org_uuid = request.headers.get("org_uuid") ?? undefined;
  console.log('✌️org_uuid --->', org_uuid);


  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;

  try {
    const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_URL;

    const formData = await request.formData();

    const response = await servicesAxiosInstance.post(`${BASE_URL}`, formData, {
      headers: {
        ...headers,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (err: any) {
    const axiosResp = err?.response;

    return NextResponse.json(
      axiosResp?.data ?? {
        message: err?.message ?? "Unknown error",
      },
      {
        status: axiosResp?.status ?? 500,
      },
    );
  }
}
