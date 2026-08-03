import { backendClient } from "@/config/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await context.params;
  const { uuid } = params;
  const body = await request.json();

  try {
    const response = await backendClient.patch(
      `/leave-requests/${uuid}/approve`,
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
