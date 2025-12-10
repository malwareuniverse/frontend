import { NextResponse } from "next/server";
import type { NextApiResponseError } from "~/interfaces/api";

/**
 * Handles non-ok responses from a backend fetch call (e.g., to FastAPI).
 * It parses the error, logs it on the server, and returns a structured
 * NextResponse object to be sent to the client.
 *
 * @param response - The Response object from the fetch call.
 * @param contextMessage - An optional message to provide context in server logs.
 * @returns A promise that resolves to a NextResponse object for the error.
 */
export async function handleFastApiErrorResponse(
  response: Response,
  contextMessage?: string
): Promise<NextResponse> {
  let errorMessage: string;
  let errorDetails: unknown;

  try {

    const bodyJson: NextApiResponseError = await response.json() as NextApiResponseError;
    errorDetails = bodyJson;

    if (bodyJson && typeof bodyJson.detail === 'string') {
      errorMessage = bodyJson.detail;
    } else {
      errorMessage = JSON.stringify(bodyJson);
    }
  } catch {
    const textBody = await response.text();
    errorMessage = textBody.substring(0, 200);
    errorDetails = textBody;
  }

  console.error(
    `${contextMessage ?? 'FastAPI request failed'} with status ${response.status}:`,
    errorDetails
  );

  return NextResponse.json(
    {
      success: false,
      error: `Backend error: ${errorMessage}`,
    } as NextApiResponseError,
    { status: response.status }
  );
}

/**
 * Creates a generic 500 internal server error response.
 * @param error - The caught error object.
 * @param contextMessage - An optional message for server logs.
 * @returns A NextResponse object for a 500 error.
 */
export function handleInternalErrorResponse(
  error: unknown,
  contextMessage?: string
): NextResponse {
  console.error(
    `${contextMessage ?? 'API Route Error'}:`,
    error
  );
  return NextResponse.json(
    {
      success: false,
      error: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}`,
    } as NextApiResponseError,
    { status: 500 }
  );
}