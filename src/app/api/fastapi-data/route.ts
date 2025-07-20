import { NextResponse, type NextRequest } from 'next/server';
import { env } from '~/env';
import type {RawApiResponse} from "~/interfaces/malware";

export interface NextApiResponseSuccess {
    success: true;
    data: RawApiResponse;
    message?: string;
}

export interface NextApiResponseError {
    success: false;
    error: string;
}

export async function GET(request: NextRequest) {

    try {
        const { searchParams } = new URL(request.url);
        const fastapiUrl = new URL('/query_weaviate', env.FASTAPI_URL);

        for (const [key, value] of searchParams.entries()) {
            fastapiUrl.searchParams.set(key, value);
        }

        fastapiUrl.searchParams.set('query', "");
        fastapiUrl.searchParams.set('collection_name', "Malware");

        console.log(`Calling FastAPI endpoint: ${fastapiUrl.toString()}`);

        const fastapiResponse = await fetch(fastapiUrl.toString());

        if (!fastapiResponse.ok) {
            const errorBody = await fastapiResponse.text();
            console.error(`FastAPI fetch failed with status ${fastapiResponse.status}: ${errorBody}`);
             return NextResponse.json(
                 { success: false, error: `Failed to fetch from FastAPI: HTTP status ${fastapiResponse.status}` } as NextApiResponseError,
                 { status: 500 }
             );
        }

        const fastapiData: RawApiResponse = await fastapiResponse.json() as RawApiResponse;

        console.log("Successfully fetched data from FastAPI.");
        console.log("FastAPI Data Shape:", fastapiData.shape);

        return NextResponse.json(
            { success: true, data: fastapiData, message: fastapiData.message } as NextApiResponseSuccess,
            { status: 200 }
        );

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { success: false, error: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` } as NextApiResponseError,
            { status: 500 }
        );
    }
}