import { backendClient } from "@/config/server";

export async function GET(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;

  try {
    const response = await backendClient.get(`/users/${uuid}/attendances`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
