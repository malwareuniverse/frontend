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
  collection_name: string,
}

export interface ProcessedFastAPIData {
  shape: [number, number];
  pacmap_applied: boolean;
  data: number[][];
  collection_name: string,
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
    detail?: string;
}

export interface CollectionsApiResponse {
  collections: Record<string, string>;
}