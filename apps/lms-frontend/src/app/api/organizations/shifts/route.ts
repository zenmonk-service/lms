import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {

    const response = await axios.get(`${BASE_URL}/organizations/shifts`, {
        headers:{org_uuid: request.headers.get("org_uuid")  }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Shifts API error:", error.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};