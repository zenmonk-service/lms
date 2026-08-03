import { backendClient } from "@/config/server";

export async function PATCH(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;
  try {
    const response = await backendClient.patch(`/users/${uuid}/check-in`, {});

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response.data,
      status: err?.response.status,
    });
  }
}
