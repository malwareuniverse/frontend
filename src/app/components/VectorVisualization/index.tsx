"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useVectorPlot } from "./useVectorPlot";
import PlotHeader from "./PlotHeader";
import PlotPlaceholder from "./PlotPlaceholder";
import type { VectorVisualizationProps } from "./types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function VectorVisualization(props: VectorVisualizationProps) {
  const {
    plotlyData,
    layout,
    statusMessage,
    interactionModes,
    handleClick,
    handleLegendClick,
    handleInteractionToggle,
  } = useVectorPlot(props);

  if (!plotlyData) {
    return <PlotPlaceholder statusMessage={statusMessage} />;
  }

  const isToggleable =
    props.colorBy === "family" || props.colorBy === "cluster";

  return (
    <div className="flex h-full w-full flex-col">
      <PlotHeader
        statusMessage={statusMessage}
        interactionMode={interactionModes[props.colorBy]}
        onInteractionToggle={
          isToggleable
            ? () =>
                handleInteractionToggle(props.colorBy as "family" | "cluster")
            : undefined
        }
      />
      <div className="w-full flex-grow">
        <Plot
          data={plotlyData}
          onClick={handleClick}
          onLegendClick={handleLegendClick}
          layout={layout}
          style={{ width: "100%", height: "100%" }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
}
