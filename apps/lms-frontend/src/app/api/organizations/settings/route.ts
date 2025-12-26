import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const org_uuid = request.headers.get("org_uuid");

    const resp = await axios.get(`${BASE_URL}/organizations/settings`, {
      headers: {
        org_uuid: org_uuid,
      },
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    const org_uuid = request.headers.get("org_uuid");

    const resp = await axios.put(`${BASE_URL}/organizations/settings`, body, {
      headers: {
        org_uuid: org_uuid,
      },
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}
