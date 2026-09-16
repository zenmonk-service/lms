import { backendClient } from "@/config/server";

export async function GET(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const { searchParams } = new URL(request.url);

    const response = await backendClient.get(`/leave-types/${uuid}/balance`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
