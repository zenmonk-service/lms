import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const data = await request.json();

    const response = await servicesAxiosInstance.post(`${BASE_URL}/organizations`, data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Login API error:", error.message || error);

    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};


export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const { searchParams } = new URL(request.url);

    const response = await servicesAxiosInstance.get(`${BASE_URL}/organizations`, {
      params: Object.fromEntries(searchParams),
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Organizations API error:", error.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};
