import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;
  try {
    const { searchParams } = new URL(request.url);

    const response = await backendClient.get(`/users/${uuid}/leave-requests`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await context.params;
  const { uuid } = params;

  const body = await request.json();

  try {
    const response = await backendClient.post(
      `/users/${uuid}/leave-requests`,
      body,
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
