import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { searchParams } = new URL(request.url);

  try {
    const response = await servicesAxiosInstance.get(`${BASE_URL}/holidays`, {
      params: Object.fromEntries(searchParams),
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};
