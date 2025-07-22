import { NextResponse } from "next/server";
import { env } from "~/env";
import type { CollectionsApiResponse } from "~/interfaces/api";
import { handleFastApiErrorResponse, handleInternalErrorResponse } from "~/lib/api-utils";

export async function GET() {
  const fastapiEndpoint = "/weaviate_collections";
  const fastapiUrl = new URL(fastapiEndpoint, env.FASTAPI_URL);

  console.log(`Calling FastAPI to get collections: ${fastapiUrl.toString()}`);

  try {
    const fastapiResponse = await fetch(fastapiUrl.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!fastapiResponse.ok) {
      return await handleFastApiErrorResponse(
        fastapiResponse,
        "FastAPI fetch for collections failed"
      );
    }

    const data = await fastapiResponse.json() as CollectionsApiResponse;
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return handleInternalErrorResponse(error, "Error in /api/weaviate-collections");
  }
}