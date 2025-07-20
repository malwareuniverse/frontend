'use client';

import { useEffect, useState, useTransition, type SetStateAction, useCallback } from "react";
import type {
  NextApiResponseError,
} from "./api/fastapi-data/route";
import VectorVisualization, {
  type SelectedPointInfo,
} from "~/app/VectorVisualization";

import type {MalwareMetadata, ProcessedFastAPIData, RawApiResponse} from "~/interfaces/malware";

export default function FastAPIDataPage() {
  const [fastApiData, setFastApiData] = useState<ProcessedFastAPIData | null>(
    null,
  );
  const [fetchStatusMessage, setFetchStatusMessage] = useState<string | null>(
    null,
  );
  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  const [applyDR, setApplyDR] = useState<boolean>(true);
  const [drMethod, setDrMethod] = useState<string>("pacmap");
  const [nComponents, setNComponents] = useState<number>(3);

  const [colorMode, setColorMode] = useState<"component" | "family" | "cluster">(
    "component",
  );
  const [isPending, startTransition] = useTransition();

  const [selectedPoint, setSelectedPoint] = useState<SelectedPointInfo | null>(
    null,
  );

  const handlePointClick = (info: SetStateAction<SelectedPointInfo | null>) => {
    console.log("Point clicked!", info);
    setSelectedPoint(info);
  };

  const handleFetchData = useCallback(() => {
    setFetchStatusMessage(null);
    setIsFetchError(false);
    setFastApiData(null);
    setSelectedPoint(null);

    startTransition(async () => {
      setFetchStatusMessage("Fetching data from FastAPI via Next.js API...");
      try {
        const apiUrl = new URL("/api/fastapi-data", window.location.origin);
        apiUrl.searchParams.set("apply_dr", String(applyDR));
        apiUrl.searchParams.set("dr_method", String(drMethod));
        apiUrl.searchParams.set("n_components", String(nComponents));
        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
          const errorBody: NextApiResponseError = await response.json() as NextApiResponseError;
          throw new Error(
            errorBody.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result: {
          success: boolean;
          data?: RawApiResponse;
          error?: string;
          message?: string;
        } = await response.json() as never;

        if (result.success && result.data) {
          if (!result.data.results || !Array.isArray(result.data.results)) {
            throw new Error(
              "API response is malformed: missing 'results' array.",
            );
          }
          const embeddings: number[][] = [];
          const metadataList: MalwareMetadata[] = [];
          for (const item of result.data.results) {
            embeddings.push(item.embedding);
            metadataList.push(item.metadata);
          }
          const processedData: ProcessedFastAPIData = {
            data: embeddings,
            metadata: metadataList,
            shape: [embeddings.length, embeddings[0]?.length ?? 0],
            pacmap_applied: result.data.pacmap_applied ?? applyDR,
            message:
              result.data.message ??
              result.message ??
              "Data processed and loaded successfully.",
          };
          setFastApiData(processedData);
          setFetchStatusMessage(processedData.message);
        } else {
          setFetchStatusMessage(
            result.error ?? "An error occurred fetching data via Next.js API.",
          );
          setIsFetchError(true);
        }
      } catch (error) {
        console.error("Error in client fetch:", error);
        setFetchStatusMessage(
          `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`,
        );
        setIsFetchError(true);
      }
    });
  }, [applyDR, drMethod, nComponents]);

  useEffect(() => {
    handleFetchData();
    // This effect runs on mount and whenever handleFetchData is recreated.
    // Because handleFetchData is wrapped in useCallback, it is only recreated
    // when its dependencies (the data fetching parameters) change.
    // This correctly triggers a data fetch on mount and when options are changed.
  }, [handleFetchData]);

  // The second useEffect hook was removed as it was redundant and caused an infinite loop.

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            FastAPI Data Fetcher & Visualizer
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Fetch malware vectors and their metadata from your FastAPI
            application and visualize the results.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            {/* Fetch Controls */}
            <div className="space-y-4 rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">
                Fetch Options
              </h2>
              <div className="flex items-center">
                <input
                  id="apply_dr"
                  type="checkbox"
                  checked={applyDR}
                  onChange={(e) => setApplyDR(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label
                  htmlFor="apply_dr"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Apply Dimensionality Reduction
                </label>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center">
                  <input
                    id="apply_pacmap"
                    type="radio"
                    name="dr_method"
                    value="pacmap"
                    checked={drMethod === "pacmap"}
                    onChange={(e) => setDrMethod(e.target.value)}
                    disabled={isPending || !applyDR}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="apply_pacmap"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    PaCMAP (Balanced)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="apply_umap"
                    type="radio"
                    name="dr_method"
                    value="umap"
                    checked={drMethod === "umap"}
                    onChange={(e) => setDrMethod(e.target.value)}
                    disabled={isPending || !applyDR}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="apply_umap"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    UMAP (Local Structure)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="apply_trimap"
                    type="radio"
                    name="dr_method"
                    value="trimap"
                    checked={drMethod === "trimap"}
                    onChange={(e) => setDrMethod(e.target.value)}
                    disabled={isPending || !applyDR}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="apply_trimap"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    TriMAP (Global Structure)
                  </label>
                </div>
              </div>
              {applyDR && (
                <div className="mt-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Visualization Dimensions
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="pacmap_components_2"
                        type="radio"
                        name="pacmap_components"
                        value="2"
                        checked={nComponents === 2}
                        onChange={() => setNComponents(2)}
                        disabled={isPending}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor="pacmap_components_2"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        2D
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="pacmap_components_3"
                        type="radio"
                        name="pacmap_components"
                        value="3"
                        checked={nComponents === 3}
                        onChange={() => setNComponents(3)}
                        disabled={isPending}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor="pacmap_components_3"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        3D
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleFetchData}
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isPending ? (
                  <>
                    {" "}
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>{" "}
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>{" "}
                    </svg>{" "}
                    Loading...{" "}
                  </>
                ) : (
                  "Fetch Data"
                )}
              </button>
            </div>
            {/* UPDATE 2: Replaced the entire "Selected Point Details" card with a more detailed one. */}
            <div className="space-y-4 rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">
                Selected Point Details
              </h2>
              {selectedPoint ? (
                <div className="space-y-2.5 text-sm max-h-[28rem] overflow-y-auto pr-2">
                  <div>
                    <span className="font-semibold text-gray-700">Family:</span>
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {selectedPoint.metadata.properties.malware_family ?? "N/A"}
                    </span>
                  </div>
                   <div>
                    <span className="font-semibold text-gray-700">Cluster:</span>
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      {selectedPoint.metadata.cluster_label ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">File Name:</span>
                    <span className="ml-2 font-mono text-xs break-all text-gray-600">
                      {selectedPoint.metadata.properties.file_name ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">SHA256:</span>
                    <span className="ml-2 font-mono text-xs break-all text-gray-600">
                      {selectedPoint.metadata.properties.sha256_hash ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">File Type:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPoint.metadata.properties.file_type ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">File Size:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPoint.metadata.properties.file_size
                        ? `${selectedPoint.metadata.properties.file_size.toLocaleString()} bytes`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Reporter:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPoint.metadata.properties.reporter ?? "N/A"}
                    </span>
                  </div>

                  <div className="!mt-4 border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-700">UUID:</span>
                    <span className="ml-2 block font-mono text-xs break-all text-gray-600">
                      {selectedPoint.metadata.uuid}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Vec Length:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedPoint.metadata.vector_length}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Coords:</span>
                    <span className="ml-2 text-gray-900">
                      [{selectedPoint.coordinates.map((c) => c.toFixed(3)).join(", ")}]
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
                  <span>Click on a point to see details.</span>
                </div>
              )}
            </div>

            {fetchStatusMessage && (
              <div
                className={`rounded-md p-4 ${isFetchError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
              >
                {" "}
                <div className="flex">
                  {" "}
                  <div className="flex-shrink-0">
                    {" "}
                    {isFetchError ? (
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {" "}
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />{" "}
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {" "}
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />{" "}
                      </svg>
                    )}{" "}
                  </div>{" "}
                  <div className="ml-3">
                    {" "}
                    <p className="text-sm font-medium">
                      {fetchStatusMessage}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            )}
          </div>
          {/* Right Column: Visualization and Results Display */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Data Visualization
                </h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium text-gray-700">Color by:</span>
                  <div className="flex items-center">
                    <input
                      id="color_component"
                      type="radio"
                      name="color_mode"
                      value="component"
                      checked={colorMode === "component"}
                      onChange={() => setColorMode("component")}
                      disabled={isPending || !fastApiData}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="color_component"
                      className="ml-2 block text-gray-900"
                    >
                      Component
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="color_family"
                      type="radio"
                      name="color_mode"
                      value="family"
                      checked={colorMode === "family"}
                      onChange={() => setColorMode("family")}
                      disabled={isPending || !fastApiData}
                      className="h-4 w-4 border--300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="color_family"
                      className="ml-2 block text-gray-900"
                    >
                      Family
                    </label>
                  </div>
                  {/* CHANGE 2: Added the 'Cluster' radio button. */}
                  <div className="flex items-center">
                    <input
                      id="color_cluster"
                      type="radio"
                      name="color_mode"
                      value="cluster"
                      checked={colorMode === "cluster"}
                      onChange={() => setColorMode("cluster")}
                      disabled={isPending || !fastApiData}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="color_cluster"
                      className="ml-2 block text-gray-900"
                    >
                      Cluster
                    </label>
                  </div>
                </div>
              </div>
           <div className="flex h-96 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                {isPending && !fastApiData ? (
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Loading visualization...</p>
                  </div>
                ) : fastApiData && fastApiData.data.length > 0 ? (
                  <div className="h-full w-full">
                    <VectorVisualization
                      data={fastApiData.data}
                      metadata={fastApiData.metadata}
                      isLoading={false}
                      colorBy={colorMode}
                      onPointClick={handlePointClick}
                    />
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    <p>No data to visualize.</p>
                  </div>
                )}
              </div>
            </div>
            {/* Results Display */}
            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">
                  FastAPI Response Details
                </h2>
              </div>
              <div className="p-6">
                {!isPending && fastApiData ? (
                  <div className="space-y-4">
                    <p>
                      <strong>Shape:</strong> [{fastApiData.shape.join(", ")}]
                    </p>
                    <p>
                      <strong>Dimension Reduction Applied:</strong>{" "}
                      {fastApiData.pacmap_applied ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Message:</strong> {fastApiData.message}
                    </p>
                    <div className="mt-4">
                      <h3 className="text-md mb-2 font-medium text-gray-900">
                        Data & Metadata Snippet (First 5 rows):
                      </h3>
                      {fastApiData.data.slice(0, 5).map((row, rowIndex) => (
                        <div
                          key={fastApiData.metadata[rowIndex]?.uuid ?? rowIndex}
                          className="font-mono text-sm break-all text-gray-700"
                        >
                          Row {rowIndex + 1}:
                          <span className="ml-2 text-blue-700">
                            Family:{" "}
                            {fastApiData.metadata[rowIndex]?.properties
                              .malware_family ?? "N/A"}
                          </span>
                          <span className="ml-2 text-gray-500">
                            Coords: [{row.slice(0, 3).join(", ")}
                            {row.length > 3 ? ", ..." : ""}]
                          </span>
                        </div>
                      ))}
                      {fastApiData.data.length > 5 && (
                        <p className="mt-2 text-sm text-gray-600">
                          ... and {fastApiData.data.length - 5} more rows.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    {isPending ? (
                      <svg
                        className="mx-auto h-8 w-8 animate-spin text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        {" "}
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>{" "}
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>{" "}
                      </svg>
                    ) : (
                      "Fetch data to see response details here."
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}