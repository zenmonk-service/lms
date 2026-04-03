import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export const GET = async (request: Request , context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> } ) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const org_uuid = request.headers.get("org_uuid"); 
  const params = await context.params;
  const { uuid } = params;

  try {
    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/organizations/${org_uuid}/users/${uuid}`,
      {
        headers: {
          org_uuid,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Organizations API error:", error.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.description },
      { status: error?.response?.status },
    );
  }
};
