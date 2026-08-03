import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ role_uuid: string }> },
) => {
  try {
    const { role_uuid } = await context.params;

    const response = await backendClient.get(`/roles/${role_uuid}`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ role_uuid: string }> },
) => {
  try {
    const { role_uuid } = await context.params;
    const { permission_uuids } = await request.json();

    const response = await backendClient.put(
      `/roles/${role_uuid}/permissions`,
      { permission_uuids },
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
