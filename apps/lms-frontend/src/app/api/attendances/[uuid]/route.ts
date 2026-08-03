import { backendClient } from "@/config/server";

export async function PUT(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;
  const body = await request.json();
  try {
    const response = await backendClient.put(`/attendances/${uuid}`, body);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
