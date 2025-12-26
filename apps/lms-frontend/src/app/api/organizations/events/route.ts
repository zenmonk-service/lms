import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await axios.get(`${BASE_URL}/organizations/events`, {
      headers: {
        org_uuid: org_uuid,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.response.status }
    );
  }
};

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const data = await request.json();
    const org_uuid = request.headers.get("org_uuid") ?? undefined;

    const response = await axios.post(
      `${BASE_URL}/organizations/events`,
      data,
      {
        headers: {
          org_uuid: org_uuid,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.response.status }
    );
  }
};
