import axios from "axios";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const data = await request.json();

    const response = await axios.post(
      `${BASE_URL}/organizations`,
      data
    );

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

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";

    const response = await axios.get(`${BASE_URL}/organizations`, {
      params: { page, limit, search },
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
