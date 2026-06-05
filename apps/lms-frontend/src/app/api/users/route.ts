import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const data = await request.json();

  try {
    const response = await servicesAxiosInstance.post(`${BASE_URL}/users`, data, {
      headers: {
        org_uuid: data.org_uuid,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const response = await servicesAxiosInstance.get(`${BASE_URL}/users`, {
      params: Object.fromEntries(new URL(request.url).searchParams),
      headers: {
        org_uuid: request.headers.get("org_uuid"),
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};



export const PUT = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const data = await request.json();
  try {
    const response = await servicesAxiosInstance.put(`${BASE_URL}/users/${data.user_uuid}`, data, {
      headers: {
        org_uuid: data.org_uuid,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
};