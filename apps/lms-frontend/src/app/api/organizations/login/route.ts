import axios from "axios";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const data = await request.json();

    const response = await axios.post(
      `${BASE_URL}/organizations/${data.organizationId}/login`,
      data
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Login API error:", error.message || error);

    return NextResponse.json(
      { error: error?.response.data.description || "An unexpected error occurred." },
      { status: error.status }
    );
  }
};
