import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const org_uuid = request.headers.get("org_uuid");
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/attendances/report`,
      {
        headers: {
          ...(org_uuid && { org_uuid }),
        },
        params: Object.fromEntries(searchParams),
      },
    );

    return NextResponse.json(response.data);
  } catch (err: any) {
    const axiosResp = err?.response;
    const status = axiosResp?.status;
    const data = axiosResp?.data ?? {
      message: err?.message ?? "Unknown error",
    };
    return NextResponse.json(data, { status });
  }
}
