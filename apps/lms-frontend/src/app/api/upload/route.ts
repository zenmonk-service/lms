import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_URL;

    const formData = await request.formData();

    const response = await servicesAxiosInstance.post(`${BASE_URL}`, formData, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (err: any) {
    const axiosResp = err?.response;

    return NextResponse.json(
      axiosResp?.data ?? {
        message: err?.message ?? "Unknown error",
      },
      {
        status: axiosResp?.status ?? 500,
      },
    );
  }
}
