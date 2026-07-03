import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context:
    | { params: { uuid: string } }
    | { params: Promise<{ uuid: string }> }
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await servicesAxiosInstance.patch(
      `${BASE_URL}/users/${uuid}/check-in`,
      {},
      {
        headers,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    const axiosResp = err?.response;
    const status = axiosResp?.status;
    const data = axiosResp?.data ?? {
      message: err?.message ?? "Unknown error",
    };
    return NextResponse.json(data, { status });
  }
}
