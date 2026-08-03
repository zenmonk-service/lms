import { backendClient } from "@/config/server";

export async function PATCH(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {

    const response = await backendClient.patch(
      `/users/${uuid}/check-out`,
      {},
      {
        headers,
      },
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
       return backendClient.errorResponse({
          data: err?.response.data,
          status: err?.response.status,
        });
  }
}
