import { backendClient } from "@/config/server";

export async function PUT(request: Request,   context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  try {
    const body = await request.json();
    const { uuid } = await context.params;

    const resp = await backendClient.put(`/organizations/settings/${uuid}`, body);

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
