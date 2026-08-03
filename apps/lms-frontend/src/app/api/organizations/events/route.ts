import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    const response = await backendClient.get(`/organizations/events`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const POST = async (request: Request) => {
  try {
    const data = await request.json();
    const response = await backendClient.post(`/organizations/events`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
