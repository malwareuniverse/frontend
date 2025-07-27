import { useMemo, useState, useEffect } from "react";
import type { Layout, PlotMouseEvent, LegendClickEvent } from "plotly.js";
import { isNumber } from "~/utils/vectorHelper";
import { generatePlotlyData } from "./plotDataTransformer";
import type {
  VectorVisualizationProps,
  InteractionMode,
  TraceVisibilityInfo,
} from "./types";

export function useVectorPlot({
  data,
  metadata,
  isLoading,
  colorBy,
  onPointClick,
}: VectorVisualizationProps) {
  const [traceVisibility, setTraceVisibility] = useState<
    TraceVisibilityInfo[] | null
  >(null);
  const [isolatedItem, setIsolatedItem] = useState<{
    type: string;
    value: string;
  } | null>(null);
  const [interactionModes, setInteractionModes] = useState<
    Record<string, InteractionMode>
  >({
    family: "isolate",
    cluster: "isolate",
  });
  const [axisRanges, setAxisRanges] = useState<{
    x: [number, number];
    y: [number, number];
    z?: [number, number];
  } | null>(null);

  useEffect(() => {
    setTraceVisibility(null);
    setIsolatedItem(null);
  }, [colorBy, data]);

  const dimension = useMemo(() => {
    if (!data || data.length === 0 || !data[0]) return 0;
    const derivedDim = data[0].length;
    return derivedDim >= 2 && derivedDim <= 3 ? derivedDim : 0;
  }, [data]);

  useEffect(() => {
    if (data && data.length > 0 && dimension >= 2) {
      const getRange = (index: number): [number, number] => {
        const values: number[] = data.map((p) => p[index]).filter(isNumber);
        if (values.length === 0) return [-1, 1];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.05 || 0.1;
        return [min - padding, max + padding];
      };
      setAxisRanges({
        x: getRange(0),
        y: getRange(1),
        z: dimension === 3 ? getRange(2) : undefined,
      });
    } else {
      setAxisRanges(null);
    }
  }, [data, dimension]);

  const plotlyData = useMemo(() => {
    const isIsolateMode = interactionModes[colorBy] === "isolate";
    return generatePlotlyData({
      data,
      metadata,
      dimension,
      colorBy,
      traceVisibility,
      isolatedItem: isIsolateMode ? isolatedItem : null,
    });
  }, [
    data,
    metadata,
    dimension,
    colorBy,
    traceVisibility,
    isolatedItem,
    interactionModes,
  ]);

  const statusMessage = useMemo(() => {
    if (isLoading) return "Loading data...";
    if (!data || data.length === 0) return "No data available.";
    if (!metadata || data.length !== metadata.length)
      return "Error: Data and metadata mismatch.";
    if (dimension === 0) return `Data is not in a plottable 2D/3D format.`;

    const isIsolateMode = interactionModes[colorBy] === "isolate";
    if (isIsolateMode && isolatedItem && colorBy === isolatedItem.type) {
      if (isolatedItem.type === "family") {
        const familyName =
          metadata.find(
            (m) =>
              (m.properties?.malware_family ?? "").toLowerCase() ===
              isolatedItem.value.toLowerCase(),
          )?.properties?.malware_family ?? isolatedItem.value;
        const pointCount = metadata.filter(
          (m) =>
            (m.properties?.malware_family ?? "").toLowerCase() ===
            isolatedItem.value.toLowerCase(),
        ).length;
        return `${pointCount} points for family "${familyName}", colored by reporter (${dimension}D)`;
      }
      if (isolatedItem.type === "cluster") {
        const clusterLabelNum = parseInt(
          isolatedItem.value.replace("Cluster ", ""),
          10,
        );
        const pointCount = metadata.filter(
          (m) => m.cluster_label === clusterLabelNum,
        ).length;
        return `${pointCount} points for "${isolatedItem.value}", colored by family (${dimension}D)`;
      }
    }
    return `${data.length} points visualized (${dimension}D)`;
  }, [
    isLoading,
    data,
    dimension,
    metadata,
    colorBy,
    isolatedItem,
    interactionModes,
  ]);

    const layout = useMemo<Partial<Layout>>(() => {
    const baseLayout: Partial<Layout> = {
      autosize: true,
      margin: { l: 20, r: 20, b: 20, t: 40, pad: 4 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "#f8f9fa",
      font: { family: "sans-serif", color: "#343a40" },
      hovermode: "closest",
      showlegend: colorBy !== "component",
      legend: {
        x: 1,
        y: 1,
        xanchor: "right",
        yanchor: "top",
        bgcolor: "rgba(255, 255, 255, 0.9)",
        bordercolor: "#dee2e6",
        borderwidth: 1,
        font: { size: 14 },
      },
    };

    if (dimension === 3) {
      return {
        ...baseLayout,
        dragmode: "turntable",
        scene: {
          uirevision: "true",
          xaxis: {
            title: "Comp. 1",
            titlefont: { size: 10, color: "#6c757d" },
            gridcolor: "#dee2e6",
            zerolinecolor: "#adb5bd",
            showbackground: false,
            autorange: false,
            range: axisRanges?.x,
          },
          yaxis: {
            title: "Comp. 2",
            titlefont: { size: 10, color: "#6c757d" },
            gridcolor: "#dee2e6",
            zerolinecolor: "#adb5bd",
            showbackground: false,
            autorange: false,
            range: axisRanges?.y,
          },
          zaxis: {
            title: "Comp. 3",
            titlefont: { size: 10, color: "#6c757d" },
            gridcolor: "#dee2e6",
            zerolinecolor: "#adb5bd",
            showbackground: false,
            autorange: false,
            range: axisRanges?.z,
          },
        },
      };
    }

     return {
      ...baseLayout,
      uirevision: "true",
      xaxis: {
        autorange: false,
        range: axisRanges?.x,
        gridcolor: "#dee2e6",
        zerolinecolor: "#adb5bd",
      },
      yaxis: {
        autorange: false,
        range: axisRanges?.y,
        gridcolor: "#dee2e6",
        zerolinecolor: "#adb5bd",
      },
    };
  }, [colorBy, dimension, axisRanges]);

  const handleClick = (event: Readonly<PlotMouseEvent>) => {
    if (event.points.length > 0) {
      const point = event.points[0];
      const originalIndex = point?.customdata as number;
      if (
        originalIndex !== undefined &&
        metadata[originalIndex] &&
        data[originalIndex]
      ) {
        onPointClick({
          metadata: metadata[originalIndex],
          coordinates: data[originalIndex],
        });
      }
    } else {
      onPointClick(null);
    }
  };

  const handleLegendClick = (event: Readonly<LegendClickEvent>): boolean => {
    const currentMode = interactionModes[colorBy];
    const isCurrentlyIsolated = currentMode === "isolate" && isolatedItem;

    if (isCurrentlyIsolated) {
      setIsolatedItem(null);
      setTraceVisibility(null);
      return false;
    }

    if (
      currentMode === "isolate" &&
      (colorBy === "family" || colorBy === "cluster")
    ) {
      const itemName = event.data[event.curveNumber]?.name;
      if (itemName && itemName !== "Unknown" && itemName !== "Unclustered") {
        setIsolatedItem({ type: colorBy, value: itemName });
        setTraceVisibility(null);
      }
      return false;
    }

    if (!plotlyData || plotlyData.length <= 1) return false;
    const clickedIndex = event.curveNumber;
    const numTraces = plotlyData.length;

    const clickedTraceName = plotlyData[clickedIndex]?.name;
    if (!clickedTraceName) return false;

    let newVisibility: TraceVisibilityInfo[];

    if (traceVisibility === null) {
      newVisibility = plotlyData.map((trace, index) => ({
        name: trace.name!,
        visible: index === clickedIndex ? true : "legendonly",
      }));
    } else {
      newVisibility = traceVisibility.map((traceInfo) => {
        if (traceInfo.name === clickedTraceName) {
          return {
            ...traceInfo,
            visible: traceInfo.visible === true ? "legendonly" : true,
          };
        }
        return traceInfo;
      });
    }

    const visibleCount = newVisibility.filter((t) => t.visible === true).length;
    if (visibleCount === 0 || visibleCount === numTraces) {
      setTraceVisibility(null);
    } else {
      setTraceVisibility(newVisibility);
    }
    return false;
  };

  const handleInteractionToggle = (key: "family" | "cluster") => {
    setIsolatedItem(null);
    setTraceVisibility(null);
    setInteractionModes((prev) => ({
      ...prev,
      [key]: prev[key] === "isolate" ? "multiselect" : "isolate",
    }));
  };

  return {
    plotlyData,
    layout,
    statusMessage,
    interactionModes,
    handleClick,
    handleLegendClick,
    handleInteractionToggle,
  };
}