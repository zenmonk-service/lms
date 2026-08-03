import { backendClient } from "@/config/server";

export async function GET(
  request: Request,
  context:
    | { params: { user_uuid: string } }
    | { params: Promise<{ user_uuid: string }> },
) {
  try {
    const routeParams = await context.params;
    const { user_uuid } = routeParams;
    const { searchParams } = new URL(request.url);

    const resp = await backendClient.get(
      `/leave-types/user/${user_uuid}/balances`,
      {
        params: Object.fromEntries(searchParams),
      },
    );

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
