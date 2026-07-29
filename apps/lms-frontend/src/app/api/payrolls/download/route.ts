import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    const { searchParams } = new URL(request.url);
    const org_uuid = request.headers.get("org_uuid");

    const response = await servicesAxiosInstance.get(`${BASE_URL}/payrolls/download`, {
      params: Object.fromEntries(searchParams),
      headers: { org_uuid },
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const headers: HeadersInit = { "Content-Type": String(contentType) };
    if (response.headers["content-disposition"]) {
      headers["Content-Disposition"] = String(response.headers["content-disposition"]);
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;

    let data = {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };

    if (err?.response?.data) {
      try {
        const text = Buffer.from(err.response.data).toString("utf-8");
        data = JSON.parse(text);
      } catch {}
    }

    return NextResponse.json(data, { status });
  }
};