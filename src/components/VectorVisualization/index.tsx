import React, { useState, useEffect } from "react";
import { useVectorPlot } from "./useVectorPlot";
import PlotHeader from "./PlotHeader";
import PlotPlaceholder from "./PlotPlaceholder";
import type { VectorVisualizationProps } from "./types";

export default function VectorVisualization(props: VectorVisualizationProps) {
  const [PlotComponent, setPlotComponent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    import("react-plotly.js")
      .then((mod) => {
        if (isMounted) {
          const ResolvedPlot = mod.default?.default || mod.default || mod;
          setPlotComponent(() => ResolvedPlot);
        }
      })
      .catch((err) => console.error("Failed to load Plotly:", err));

    return () => {
      isMounted = false;
    };
  }, []);

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
        {!PlotComponent ? (
          <PlotPlaceholder statusMessage="Loading plotting library..." />
        ) : (
          <PlotComponent
            data={plotlyData}
            onClick={handleClick}
            onLegendClick={handleLegendClick}
            layout={layout}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: true, responsive: true, displaylogo: false }}
            useResizeHandler={true}
          />
        )}
      </div>
    </div>
  );
}
