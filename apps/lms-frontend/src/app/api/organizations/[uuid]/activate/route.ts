import { backendClient } from "@/config/server";

export const PATCH = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) => {
  const params = await context.params;
  const { uuid } = params;

  try {
    const response = await backendClient.patch(
      `/organizations/${uuid}/activate`,
    );
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
