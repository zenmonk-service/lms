import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context:
    | { params: { user_uuid: string } }
    | { params: Promise<{ user_uuid: string }> }
) {
  const params = await Promise.resolve(context.params);
  const { user_uuid } = params;
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await axios.get(
      `${BASE_URL}/users/${user_uuid}/attendances`,
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
