'use client';

import { useState, useRef, useEffect } from 'react';
import type { SetStateAction } from 'react';
import type { ProcessedFastAPIData } from "~/interfaces/api";
import type { SelectedPointInfo } from "~/app/components/VectorVisualization/types";
import VectorVisualization from "~/app/components/VectorVisualization";

interface VisualizationPanelProps {
  data: ProcessedFastAPIData | null;
  isLoading: boolean;
  colorMode: "component" | "family" | "cluster" | 'reporter';
  setColorMode: (mode: "component" | "family" | "cluster" | "reporter") => void;
  onPointClick: (info: SetStateAction<SelectedPointInfo | null>) => void;
}

export default function VisualizationPanel({ data, isLoading, colorMode, setColorMode, onPointClick }: VisualizationPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const panelContent = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-900">Data Visualization</h2>
        <div className="flex items-center gap-4">
          <div className="flex mr-10 items-center space-x-4 text-sm">
            <span className="font-medium text-gray-700">Color by:</span>
            <div className="flex items-center">
              <input id="color_component" type="radio" name="color_mode" value="component" checked={colorMode === "component"} onChange={() => setColorMode("component")} disabled={isLoading || !data} className="h-4 w-4" />
              <label htmlFor="color_component" className="ml-2 block text-gray-900">Component</label>
            </div>
            <div className="flex items-center">
              <input id="color_family" type="radio" name="color_mode" value="family" checked={colorMode === "family"} onChange={() => setColorMode("family")} disabled={isLoading || !data} className="h-4 w-4" />
              <label htmlFor="color_family" className="ml-2 block text-gray-900">Family</label>
            </div>
            <div className="flex items-center">
              <input id="color_cluster" type="radio" name="color_mode" value="cluster" checked={colorMode === "cluster"} onChange={() => setColorMode("cluster")} disabled={isLoading || !data} className="h-4 w-4" />
              <label htmlFor="color_cluster" className="ml-2 block text-gray-900">Cluster</label>
            </div>
            <div className="flex items-center">
              <input id="color_reporter" type="radio" name="color_mode" value="reporter" checked={colorMode === "reporter"} onChange={() => setColorMode("reporter")} disabled={isLoading || !data} className="h-4 w-4" />
              <label htmlFor="color_reporter" className="ml-2 block text-gray-900">Reporter</label>
            </div>
          </div>

          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
                <span>Exit</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
        {isLoading && !data ? (
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Loading visualization...</p>
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="h-full w-full">
            <VectorVisualization data={data.data} metadata={data.metadata} isLoading={false} colorBy={colorMode} onPointClick={onPointClick} />
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500"><p>No data to visualize.</p></div>
        )}
      </div>
    </>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <>
        {/* Keep a placeholder in the normal flow */}
        <div className="rounded-lg bg-white p-6 shadow h-96" />

        {/* Fullscreen overlay */}
        <div className="fixed inset-0 z-50 bg-white p-6" ref={containerRef}>
          {panelContent}
        </div>
      </>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow" ref={containerRef}>
      {panelContent}
    </div>
  );
}