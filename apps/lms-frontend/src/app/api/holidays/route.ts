import axios from "axios";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const response = await axios.get(`${BASE_URL}/holidays`, {
      params: Object.fromEntries(new URL(request.url).searchParams),
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status }
    );
  }
};
