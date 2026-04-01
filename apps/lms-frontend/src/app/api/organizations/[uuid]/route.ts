import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const PUT = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const data = await request.json();

    const response = await servicesAxiosInstance.put(`${BASE_URL}/organizations/${uuid}`, data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};

export const GET = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const params = await context.params;
  const { uuid } = params;

  try {
    const response = await servicesAxiosInstance.get(`${BASE_URL}/organizations/${uuid}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};

