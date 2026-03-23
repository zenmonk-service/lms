import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = new URL(request.url);
    const params: Record<string, string | string[]> = {};
    url.searchParams.forEach((v, k) => {
      if (k !== "date_range[]") params[k] = v;
    });
    const dateRange = url.searchParams.getAll("date_range[]");
    if (dateRange.length > 0) {
      params["date_range"] = dateRange;
    }

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const resp = await axios.get(`${BASE_URL}/leave-requests`, {
      params,
      headers,
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: any) {
    const axiosResp = err?.response;
    const status = axiosResp?.status;
    const data = axiosResp?.data ?? {
      message: err?.message ?? "Unknown error",
    };
    return NextResponse.json(data, { status });
  }
}
