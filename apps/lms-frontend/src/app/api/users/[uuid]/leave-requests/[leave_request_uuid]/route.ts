import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid, leave_request_uuid } = params;
    const response = await backendClient.get(
      `/users/${uuid}/leave-requests/${leave_request_uuid}`,
      { params },
    );
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}

export async function PUT(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  const params = await context.params;
  const { uuid, leave_request_uuid } = params;
  const body = await request.json();
  try {
    const response = await backendClient.put(
      `/users/${uuid}/leave-requests/${leave_request_uuid}`,
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

export async function DELETE(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  const params = await context.params;
  const { uuid, leave_request_uuid } = params;
  try {
    const response = await backendClient.delete(
      `/users/${uuid}/leave-requests/${leave_request_uuid}`,
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
