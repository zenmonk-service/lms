import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const response = await backendClient.get(`/users/${uuid}/documents`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response.data,
      status: err?.response.status,
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const data = await request.json();
    const response = await backendClient.post(`/users/${uuid}/documents`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response.data,
      status: err?.response.status,
    });
  }
}
