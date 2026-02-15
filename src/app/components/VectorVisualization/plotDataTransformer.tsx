import type { Data } from "plotly.js";
import {
  ColorManager,
  getDistinctColor,
  groupDataForTraces,
} from "~/utils/vectorHelper"; // Use improved version
import type { PlotDataTransformerArgs } from "./types";
import type { MalwareMetadata } from "~/interfaces/malware";

/**
 * Improved plot data generator with better color differentiation.
 *
 * Key improvements:
 * 1. Uses ColorManager for sequential palette assignment (no hash collisions)
 * 2. Larger markers for better visibility
 * 3. Slight transparency adjustment for overlapping points
 * 4. Better contrast for unknown/unclustered items
 */
export function generatePlotlyData({
  data,
  metadata,
  dimension,
  colorBy,
  traceVisibility,
  isolatedItem,
}: PlotDataTransformerArgs): Data[] | null {
  if (!data || !metadata || data.length !== metadata.length || dimension < 2)
    return null;

  // Create a fresh color manager for this render to ensure sequential assignment
  const colorManager = new ColorManager();

  const commonMarkerProps = {
    size: dimension === 3 ? 5 : 7, // Slightly larger for visibility
    opacity: 0.85,
    line: {
      width: 0.5,
      color: "rgba(255,255,255,0.3)", // Subtle outline for separation
    },
  };

  const commonHoverProps = {
    hoverinfo: "text" as const,
    hoverlabel: {
      bgcolor: "white",
      font: { size: 11 },
      bordercolor: "#ccc",
    },
  };

  // Unknown/unclustered styling
  const unknownColor = "#b0b0b0";
  const unknownMarkerProps = {
    ...commonMarkerProps,
    size: dimension === 3 ? 3 : 5, // Smaller for less visual noise
    opacity: 0.5,
  };

  if (isolatedItem?.value) {
    if (isolatedItem.type === "family") {
      const familyPointsData: number[][] = [];
      const familyMetadata: MalwareMetadata[] = [];
      const originalIndices: number[] = [];

      metadata.forEach((meta, index) => {
        if (
          (meta.properties?.malware_family ?? "Unknown").toLowerCase() ===
          isolatedItem.value.toLowerCase()
        ) {
          const point = data[index];
          if (point) {
            familyPointsData.push(point);
            familyMetadata.push(meta);
            originalIndices.push(index);
          }
        }
      });

      const groupedByReporter = groupDataForTraces(
        familyPointsData,
        familyMetadata,
        (m) => m.properties?.reporter ?? undefined,
        originalIndices
      );

      const traces = Object.entries(groupedByReporter).map(([key, group]) => {
        const isUnknown = key === "unknown";
        return {
          x: group.points.map((p) => p[0]),
          y: group.points.map((p) => p[1]),
          z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
          name: group.originalName ?? undefined,
          text: group.indices.map(
            (originalIndex) =>
              `Reporter: <b>${metadata[originalIndex]?.properties?.reporter ?? "N/A"}</b><br>` +
              `Family: ${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}<br>` +
              `Coords: [${data[originalIndex]
                ?.slice(0, 3)
                .map((c) => c.toFixed(2))
                .join(", ")}]`
          ),
          customdata: group.indices,
          mode: "markers",
          type: dimension === 3 ? "scatter3d" : "scattergl",
          marker: {
            ...(isUnknown ? unknownMarkerProps : commonMarkerProps),
            color: isUnknown ? unknownColor : colorManager.getColor(key),
          },
          ...commonHoverProps,
        };
      });

      traces.sort((a, b) =>
        a.name === "Unknown"
          ? 1
          : b.name === "Unknown"
            ? -1
            : a.name.localeCompare(b.name)
      );
      return traces as Data[];
    }

    if (isolatedItem.type === "cluster") {
      const clusterPointsData: number[][] = [];
      const clusterMetadata: MalwareMetadata[] = [];
      const originalIndices: number[] = [];
      const isolatedClusterLabel = parseInt(
        isolatedItem.value.replace("Cluster ", ""),
        10
      );

      if (!isNaN(isolatedClusterLabel)) {
        metadata.forEach((meta, index) => {
          if (meta.cluster_label === isolatedClusterLabel) {
            const point = data[index];
            if (point) {
              clusterPointsData.push(point);
              clusterMetadata.push(meta);
              originalIndices.push(index);
            }
          }
        });
      }

      const groupedByFamily = groupDataForTraces(
        clusterPointsData,
        clusterMetadata,
        (m) => m.properties?.malware_family ?? undefined,
        originalIndices
      );

      const traces = Object.entries(groupedByFamily).map(([key, group]) => {
        const isUnknown = key === "unknown";
        return {
          x: group.points.map((p) => p[0]),
          y: group.points.map((p) => p[1]),
          z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
          name: group.originalName ?? undefined,
          text: group.indices.map(
            (originalIndex) =>
              `Family: <b>${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}</b><br>` +
              `Cluster: ${metadata[originalIndex]?.cluster_label ?? "N/A"}<br>` +
              `Reporter: ${metadata[originalIndex]?.properties?.reporter ?? "N/A"}<br>` +
              `Coords: [${data[originalIndex]
                ?.slice(0, 3)
                .map((c) => c.toFixed(2))
                .join(", ")}]`
          ),
          customdata: group.indices,
          mode: "markers",
          type: dimension === 3 ? "scatter3d" : "scattergl",
          marker: {
            ...(isUnknown ? unknownMarkerProps : commonMarkerProps),
            color: isUnknown ? unknownColor : colorManager.getColor(key),
          },
          ...commonHoverProps,
        };
      });

      traces.sort((a, b) =>
        a.name === "Unknown"
          ? 1
          : b.name === "Unknown"
            ? -1
            : a.name.localeCompare(b.name)
      );
      return traces as Data[];
    }
  }

  let baseTraces: Data[] | null = null;

  if (colorBy === "component") {
    // Use a more perceptually uniform colorscale
    baseTraces = [
      {
        x: data.map((p) => p[0]),
        y: data.map((p) => p[1]),
        z: dimension === 3 ? data.map((p) => p[2]) : undefined,
        text: data.map(
          (point, index) =>
            `Family: <b>${metadata[index]?.properties?.malware_family ?? "N/A"}</b><br>` +
            `Coords: [${point
              .slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`
        ),
        customdata: data.map((_, index) => index),
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...commonMarkerProps,
          color: data.map((p) => p[0]),
          colorscale: "Turbo", // More perceptually distinct than Viridis
          colorbar: {
            title: "Component 1",
            thickness: 15,
            len: 0.75,
            y: 0.5,
            titlefont: { size: 10 },
            tickfont: { size: 8 },
          },
        },
        ...commonHoverProps,
      },
    ] as Data[];
  }

  if (colorBy === "family" || colorBy === "reporter") {
    const keyExtractor = (colorBy === "family"
      ? (m: MalwareMetadata) => m.properties?.malware_family ?? undefined
      : (m: MalwareMetadata) => m.properties?.reporter ?? undefined);

    const groupedData = groupDataForTraces(data, metadata, keyExtractor);

    // Sort keys first to ensure consistent color assignment across renders
    const sortedEntries = Object.entries(groupedData).sort(([keyA, groupA], [keyB, groupB]) => {
      if (keyA === "unknown") return 1;
      if (keyB === "unknown") return -1;
      // Sort by group size (largest first) for most important categories to get best colors
      return groupB.points.length - groupA.points.length;
    });

    const traces = sortedEntries.map(([key, group]) => {
      const isUnknown = key === "unknown";
      return {
        x: group.points.map((p) => p[0]),
        y: group.points.map((p) => p[1]),
        z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
        name: group.originalName,
        text: group.indices.map(
          (originalIndex) =>
            `Family: <b>${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}</b><br>` +
            `Reporter: ${metadata[originalIndex]?.properties?.reporter ?? "N/A"}<br>` +
            `Coords: [${data[originalIndex]
              ?.slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`
        ),
        customdata: group.indices,
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...(isUnknown ? unknownMarkerProps : commonMarkerProps),
          color: isUnknown ? unknownColor : colorManager.getColor(key),
        },
        ...commonHoverProps,
      };
    });

    // Re-sort for legend display (alphabetical, unknown last)
    traces.sort((a, b) =>
      a.name === "Unknown"
        ? 1
        : b.name === "Unknown"
          ? -1
          : a.name.localeCompare(b.name)
    );
    baseTraces = traces as Data[];
  }

  if (colorBy === "cluster") {
    const groupedData = groupDataForTraces(data, metadata, (m) =>
      m.cluster_label != null && m.cluster_label >= 0
        ? `Cluster ${m.cluster_label}`
        : "Unclustered"
    );

    const traces = Object.entries(groupedData).map(([key, group]) => {
      const isUnclustered = key === "unclustered";
      const clusterNum = isUnclustered
        ? -1
        : parseInt(group.originalName.replace("Cluster ", ""), 10);

      return {
        x: group.points.map((p) => p[0]),
        y: group.points.map((p) => p[1]),
        z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
        name: group.originalName,
        text: group.indices.map(
          (originalIndex) =>
            `Cluster: <b>${metadata[originalIndex]?.cluster_label ?? "N/A"}</b><br>` +
            `Family: ${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}<br>` +
            `Coords: [${data[originalIndex]
              ?.slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`
        ),
        customdata: group.indices,
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...(isUnclustered ? unknownMarkerProps : commonMarkerProps),
          color: isUnclustered ? unknownColor : getDistinctColor(clusterNum),
        },
        ...commonHoverProps,
      };
    });

    traces.sort((a, b) =>
      a.name === "Unclustered"
        ? 1
        : b.name === "Unclustered"
          ? -1
          : parseInt(a.name.replace("Cluster ", "")) -
            parseInt(b.name.replace("Cluster ", ""))
    );
    baseTraces = traces as Data[];
  }

  if (!baseTraces) return null;

  if (traceVisibility) {
    return baseTraces.map((trace) => ({
      ...trace,
      visible:
        traceVisibility.find((t) => t.name === trace.name)?.visible ?? true,
    }));
  }

  return baseTraces;
}