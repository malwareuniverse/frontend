import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import type { RawApiResponse } from "~/interfaces/malware";
import type { NextApiResponseSuccess } from "~/interfaces/api";
import { handleFastApiErrorResponse, handleInternalErrorResponse } from "~/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fastapiUrl = new URL("/query_weaviate", env.FASTAPI_URL);

  for (const [key, value] of searchParams.entries()) {
    fastapiUrl.searchParams.set(key, value);
  }
  fastapiUrl.searchParams.set("query", "");

  console.log(`Calling FastAPI endpoint: ${fastapiUrl.toString()}`);

  try {
    const fastapiResponse = await fetch(fastapiUrl.toString());

    if (!fastapiResponse.ok) {
      return await handleFastApiErrorResponse(
        fastapiResponse,
        "FastAPI weaviate query failed"
      );
    }

    const fastapiData: RawApiResponse = await fastapiResponse.json() as RawApiResponse;
    return NextResponse.json(
      {
        success: true,
        data: fastapiData,
        message: fastapiData.message,
      } as NextApiResponseSuccess,
      { status: 200 }
    );
  } catch (error) {
    return handleInternalErrorResponse(error, "Error in /api/query_weaviate");
  }
}