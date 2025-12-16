import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { searchParams } = new URL(request.url);

  const email = searchParams.get("email") || "";
  try {
    const response = await axios.get(`${BASE_URL}/users/by-email`, {
      params: { email },
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
