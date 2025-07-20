import type { MalwareMetadata } from "./malware";

export interface NextApiResponseError {
  error: string;
}

export interface RawApiResponse {
  results: {
    embedding: number[];
    metadata: MalwareMetadata;
  }[];
  pacmap_applied?: boolean;
  message?: string;
}

export interface ProcessedFastAPIData {
  shape: [number, number];
  pacmap_applied: boolean;
  data: number[][];
  metadata: MalwareMetadata[];
  message: string;
}
export interface NextApiResponseSuccess {
    success: true;
    data: RawApiResponse;
    message?: string;
}

export interface NextApiResponseError {
    success: false;
    error: string;
}
