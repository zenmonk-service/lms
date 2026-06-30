import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await context.params;
  const { uuid } = params;

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search");

  try {
    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/organizations`,
      { params: { page, limit, search } },
    );

    return NextResponse.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}
