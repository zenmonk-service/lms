import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const { searchParams } = new URL(request.url);
    const org_uuid = request.headers.get("org_uuid");

    const response = await servicesAxiosInstance.get(`${BASE_URL}/payrolls`, {
      params: Object.fromEntries(searchParams),
      headers: { org_uuid },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status },
    );
  }
};

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const { body } = await request.json();
    const org_uuid = request.headers.get("org_uuid");

    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/payrolls`,
      body,
      { headers: { org_uuid } },
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status },
    );
  }
};
