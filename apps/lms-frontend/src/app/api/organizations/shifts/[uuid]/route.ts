import axios from "axios";
import { NextResponse } from "next/server";

export const PUT = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const body = await request.json();
    const response = await axios.put(
      `${BASE_URL}/organizations/shifts/${uuid}`,
      body,
      {
        headers: { org_uuid: request.headers.get("org_uuid") },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Shifts API error:", error.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};

export const DELETE = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const response = await axios.delete(
      `${BASE_URL}/organizations/shifts/${uuid}`,
      {
        headers: { org_uuid: request.headers.get("org_uuid") },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Shifts API error:", error.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};
