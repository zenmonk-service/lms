import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context:
    | { params: { uuid: string; document_uuid: string } }
    | { params: Promise<{ uuid: string; document_uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid, document_uuid } = params;

    const response = await backendClient.delete(
      `/users/${uuid}/documents/${document_uuid}`,
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response.data,
      status: err?.response.status,
    });
  }
}
