import React, { lazy, Suspense } from "react";
import { useVectorPlot } from "./useVectorPlot";
import PlotHeader from "./PlotHeader";
import PlotPlaceholder from "./PlotPlaceholder";
import type { VectorVisualizationProps } from "./types";

const Plot = lazy(() => import("react-plotly.js"));

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
        <Suspense fallback={<PlotPlaceholder statusMessage={statusMessage} />}>
          <Plot
            data={plotlyData}
            onClick={handleClick}
            onLegendClick={handleLegendClick}
            layout={layout}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: true, responsive: true, displaylogo: false }}
            useResizeHandler={true}
          />
        </Suspense>
      </div>
    </div>
  );
}
