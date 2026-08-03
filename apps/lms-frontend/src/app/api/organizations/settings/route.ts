import { backendClient } from "@/config/server";

export async function GET(request: Request) {
  try {
    const org_uuid = request.headers.get("org_uuid");
    const resp = await backendClient.get(`/organizations/settings`, {
      headers: {
        org_uuid: org_uuid || "",
      },
    });
    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const resp = await backendClient.put(`/organizations/settings`, body);

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
