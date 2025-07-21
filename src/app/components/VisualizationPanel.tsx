'use client';

import type { SetStateAction } from 'react';
import type {ProcessedFastAPIData} from "~/interfaces/api";
import type {SelectedPointInfo} from "~/app/components/VectorVisualization/types";
import VectorVisualization from "~/app/components/VectorVisualization";

interface VisualizationPanelProps {
  data: ProcessedFastAPIData | null;
  isLoading: boolean;
  colorMode: "component" | "family" | "cluster" | 'reporter';
  setColorMode: (mode: "component" | "family" | "cluster" | "reporter") => void;
  onPointClick: (info: SetStateAction<SelectedPointInfo | null>) => void;
}

export default function VisualizationPanel({ data, isLoading, colorMode, setColorMode, onPointClick }: VisualizationPanelProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-900">Data Visualization</h2>
        <div className="flex items-center space-x-4 text-sm">
          <span className="font-medium text-gray-700">Color by:</span>
          {/* Controls */}
          <div className="flex items-center"><input id="color_component" type="radio" name="color_mode" value="component" checked={colorMode === "component"} onChange={() => setColorMode("component")} disabled={isLoading || !data} className="h-4 w-4" /><label htmlFor="color_component" className="ml-2 block text-gray-900">Component</label></div>
          <div className="flex items-center"><input id="color_family" type="radio" name="color_mode" value="family" checked={colorMode === "family"} onChange={() => setColorMode("family")} disabled={isLoading || !data} className="h-4 w-4" /><label htmlFor="color_family" className="ml-2 block text-gray-900">Family</label></div>
          <div className="flex items-center"><input id="color_cluster" type="radio" name="color_mode" value="cluster" checked={colorMode === "cluster"} onChange={() => setColorMode("cluster")} disabled={isLoading || !data} className="h-4 w-4" /><label htmlFor="color_cluster" className="ml-2 block text-gray-900">Cluster</label></div>
          <div className="flex items-center"><input id="color_cluster" type="radio" name="color_mode" value="cluster" checked={colorMode === "reporter"} onChange={() => setColorMode("reporter")} disabled={isLoading || !data} className="h-4 w-4" /><label htmlFor="color_cluster" className="ml-2 block text-gray-900">Reporter</label></div>

        </div>
      </div>
      <div className="flex h-96 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        {isLoading && !data ? (
          <div className="text-center"><svg className="mx-auto h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-2 text-sm text-gray-500">Loading visualization...</p></div>
        ) : data && data.data.length > 0 ? (
          <div className="h-full w-full">
            <VectorVisualization data={data.data} metadata={data.metadata} isLoading={false} colorBy={colorMode} onPointClick={onPointClick} />
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500"><p>No data to visualize.</p></div>
        )}
      </div>
    </div>
  );
}