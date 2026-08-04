import { backendClient } from "@/config/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(
      `/attendances/report`,
      {
        params: Object.fromEntries(searchParams),
      },
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
