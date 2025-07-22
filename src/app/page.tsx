"use client";

import {
  useEffect,
  useState,
  type SetStateAction,
  useRef,
  useCallback,
} from "react";
import { useMalwareData } from "~/hooks/useMalwareData";
import { useSmoothScroll } from "~/hooks/useSmoothScroll";
import { useWeaviateCollections } from "~/hooks/useWeaviateCollections";

import { Accordion } from "./components/Accordion";
import { ExplanationContent } from "./components/ExplanationContent";
import FetchControls from "./components/FetchControls";
import SelectedPointDetails from "./components/SelectedPointDetails";
import StatusAlert from "./components/StatusAlert";
import VisualizationPanel from "./components/VisualizationPanel";
import type { SelectedPointInfo } from "~/app/components/VectorVisualization/types";
import {
  ArrowsUpFromLine,
  ArrowDownFromLine,
  ArrowUpDown,
} from "lucide-react";

export default function FastAPIDataPage() {
  const [collection, setCollection] = useState<string>("");
  const [applyDR, setApplyDR] = useState<boolean>(true);
  const [drMethod, setDrMethod] = useState<string>("pacmap");
  const [nComponents, setNComponents] = useState<number>(3);
  const [colorMode, setColorMode] = useState<
    "component" | "family" | "cluster" | "reporter"
  >("component");
  const [selectedPoint, setSelectedPoint] = useState<SelectedPointInfo | null>(
    null,
  );
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFetchControlsFirst, setIsFetchControlsFirst] = useState(true);

  const {
    collections: availableCollections,
    isLoading: isCollectionsLoading,
    error: collectionsError,
  } = useWeaviateCollections();

  const {
    data: fastApiData,
    statusMessage,
    isError,
    isPending,
    fetchData,
  } = useMalwareData();
  const { startScroll } = useSmoothScroll();

  const accordionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (availableCollections.length > 0 && !collection) {
      setCollection(availableCollections[0]!);
    }
  }, [availableCollections, collection]);

  const handleFetchData = useCallback(() => {
    if (!collection) {
      console.warn("Fetch attempt without a selected collection.");
      return;
    }
    setSelectedPoint(null);
    void fetchData({ collection, applyDR, drMethod, nComponents });
  }, [applyDR, collection, drMethod, fetchData, nComponents]);

  useEffect(() => {
    if (collection) {
      handleFetchData();
    }
  }, [collection, applyDR, drMethod, nComponents, handleFetchData]);

  const handlePointClick = (info: SetStateAction<SelectedPointInfo | null>) => {
    console.log("Point clicked!", info);
    setSelectedPoint(info);
  };

  const handleAccordionToggle = (isOpen: boolean) => {
    if (isOpen) {
      setTimeout(() => {
        startScroll({
          targetElement: accordionContainerRef.current,
          duration: 500,
        });
      }, 100);
    }
  };

  const toggleFullWidth = () => {
    setIsFullWidth((prev) => !prev);
  };

  const toggleControlsOrder = () => {
    setIsFetchControlsFirst((prev) => !prev);
  };


  const fetchControlsComponent = (
    <FetchControls
      collection={collection}
      setCollection={setCollection}
      availableCollections={availableCollections}
      isCollectionsLoading={isCollectionsLoading}
      collectionsError={collectionsError}
      applyDR={applyDR}
      setApplyDR={setApplyDR}
      drMethod={drMethod}
      setDrMethod={setDrMethod}
      nComponents={nComponents}
      setNComponents={setNComponents}
      isPending={isPending}
      onFetch={handleFetchData}
    />
  );

  const selectedPointComponent = (
    <SelectedPointDetails selectedPoint={selectedPoint} />
  );

  const swapButton = (
    <button
      onClick={toggleControlsOrder}
      title="Swap Controls Order"
      className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <ArrowUpDown className="h-5 w-5" />
    </button>
  );

  const ControlsSidebar = (
    <div className="space-y-6">
      {isFetchControlsFirst ? (
        <>
          <div className="relative">
            {swapButton}
            {fetchControlsComponent}
          </div>
          {selectedPointComponent}
        </>
      ) : (
        <>
          <div className="relative">
            {swapButton}
            {selectedPointComponent}
          </div>
          {fetchControlsComponent}
        </>
      )}
      <StatusAlert message={statusMessage} isError={isError} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 via-white to-white">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl ring-1 shadow-indigo-600/10 ring-indigo-50 sm:-mr-80 lg:-mr-96"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Malware
              </span>{" "}
              Vector Visualizer
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              An interactive tool to analyze malware embeddings from a FastAPI
              backend.
            </p>
          </div>

          <div className="mt-16 flow-root sm:mt-24">
            <div
              ref={accordionContainerRef}
              className="-m-2 rounded-xl bg-white/70 p-2 ring-1 ring-gray-900/10 backdrop-blur-lg ring-inset lg:-m-4 lg:rounded-2xl lg:p-4"
            >
              <Accordion title="How It Works" onToggle={handleAccordionToggle}>
                <ExplanationContent />
              </Accordion>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <main
          className={`grid grid-cols-1 gap-8 ${
            !isFullWidth ? "lg:grid-cols-3" : "lg:grid-cols-1"
          }`}
        >
          {!isFullWidth && (
            <div className="lg:col-span-1">{ControlsSidebar}</div>
          )}

          <div
            className={`space-y-6 ${
              !isFullWidth ? "lg:col-span-2" : "lg:col-span-1"
            }`}
          >
            <div className="relative">
              <button
                onClick={toggleFullWidth}
                title={isFullWidth ? "Collapse View" : "Expand View"}
                className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isFullWidth ? (
                  <ArrowsUpFromLine className="h-5 w-5 text-gray-600" />
                ) : (
                  <ArrowDownFromLine className="h-5 w-5 text-gray-600" />
                )}
              </button>

              <VisualizationPanel
                data={fastApiData}
                isLoading={isPending}
                colorMode={colorMode}
                setColorMode={setColorMode}
                onPointClick={handlePointClick}
              />
            </div>

            {isFullWidth && (
              <div className="lg:col-span-1">{ControlsSidebar}</div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">
                  FastAPI Response Details
                </h2>
              </div>
              <div className="p-6">
                {!isPending && fastApiData ? (
                  <div className="space-y-4 text-sm">
                    {fastApiData.collection_name && <p><strong>Collection:</strong> {fastApiData.collection_name}</p>}
                    <p>
                      <strong>Shape:</strong> [{fastApiData.shape.join(", ")}]
                    </p>
                    <p>
                      <strong>DR Applied:</strong>{" "}
                      {fastApiData.pacmap_applied ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Message:</strong> {fastApiData.message}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    {isPending
                      ? "Loading response details..."
                      : "Fetch data to see response details here."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}