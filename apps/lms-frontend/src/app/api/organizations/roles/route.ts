import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const org_uuid = request.headers.get("org_uuid");

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search");
  try {
    const response = await axios.get(`${BASE_URL}/roles`, {
      headers: {
        org_uuid: org_uuid,
      },
      params: {
        page,
        limit,
        search,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error.status }
    );
  }
};

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const org_uuid = request.headers.get("org_uuid");

  const body = await request.json();
  try {
    const response = await axios.post(`${BASE_URL}/roles`, body, {
      headers: {
        org_uuid: org_uuid,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error.status }
    );
  }
};
