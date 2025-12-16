import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ role_uuid: string }> }
) => {
  try {
    const { role_uuid } = await context.params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await axios.get(`${BASE_URL}/roles/${role_uuid}`, {
      headers: {
        ...(org_uuid ? { org_uuid } : {}),
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    const axiosResp = err?.response;
    const status = axiosResp?.status ?? 500;
    const data = axiosResp?.data ?? {
      message: err?.message ?? "Unknown error",
    };
    return NextResponse.json(data, { status });
  }
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ role_uuid: string }> }
) => {
  try {
    const { role_uuid } = await context.params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const { permission_uuids } = await request.json();

    const response = await axios.put(
      `${BASE_URL}/roles/${role_uuid}/permissions`,
      { permission_uuids },
      {
        headers: {
          ...(org_uuid ? { org_uuid } : {}),
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    const axiosResp = err?.response;
    const status = axiosResp?.status ?? 500;
    const data = axiosResp?.data ?? {
      message: err?.message ?? "Unknown error",
    };
    return NextResponse.json(data, { status });
  }
};
