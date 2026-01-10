import type { Data } from "plotly.js";
import {
  getDistinctColor,
  groupDataForTraces,
  stringToColor,
} from "~/utils/vectorHelper";
import type { PlotDataTransformerArgs } from "./types";
import type { MalwareMetadata } from "~/interfaces/malware";

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

  const commonMarkerProps = { size: dimension === 3 ? 4 : 6, opacity: 0.8 };
  const commonHoverProps = {
    hoverinfo: "text" as const,
    hoverlabel: { bgcolor: "white", font: { size: 10 } },
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
        (m) => m.properties?.reporter,
        originalIndices,
      );
      const traces = Object.entries(groupedByReporter).map(([key, group]) => ({
        x: group.points.map((p) => p[0]),
        y: group.points.map((p) => p[1]),
        z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
        name: group.originalName,
        text: group.indices.map(
          (originalIndex) =>
            `Reporter: <b>${metadata[originalIndex]?.properties?.reporter ?? "N/A"}</b><br>Family: ${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}<br>Coords: [${data[
              originalIndex
            ]
              ?.slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`,
        ),
        customdata: group.indices,
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...commonMarkerProps,
          color: key === "unknown" ? "#cccccc" : stringToColor(key),
        },
        ...commonHoverProps,
      }));
      traces.sort((a, b) =>
        a.name === "Unknown"
          ? 1
          : b.name === "Unknown"
            ? -1
            : a.name.localeCompare(b.name),
      );
      return traces as Data[];
    }

    if (isolatedItem.type === "cluster") {
      const clusterPointsData: number[][] = [];
      const clusterMetadata: MalwareMetadata[] = [];
      const originalIndices: number[] = [];
      const isolatedClusterLabel = parseInt(
        isolatedItem.value.replace("Cluster ", ""),
        10,
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
        (m) => m.properties?.malware_family,
        originalIndices,
      );
      const traces = Object.entries(groupedByFamily).map(([key, group]) => ({
        x: group.points.map((p) => p[0]),
        y: group.points.map((p) => p[1]),
        z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
        name: group.originalName,
        text: group.indices.map(
          (originalIndex) =>
            `Family: <b>${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}</b><br>Cluster: ${metadata[originalIndex]?.cluster_label ?? "N/A"}<br>Reporter: ${metadata[originalIndex]?.properties?.reporter ?? "N/A"}<br>Coords: [${data[
              originalIndex
            ]
              ?.slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`,
        ),
        customdata: group.indices,
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...commonMarkerProps,
          color: key === "unknown" ? "#cccccc" : stringToColor(key),
        },
        ...commonHoverProps,
      }));
      traces.sort((a, b) =>
        a.name === "Unknown"
          ? 1
          : b.name === "Unknown"
            ? -1
            : a.name.localeCompare(b.name),
      );
      return traces as Data[];
    }
  }

  let baseTraces: Data[] | null = null;

  if (colorBy === "component") {
    baseTraces = [
      {
        x: data.map((p) => p[0]),
        y: data.map((p) => p[1]),
        z: dimension === 3 ? data.map((p) => p[2]) : undefined,
        text: data.map(
          (point, index) =>
            `Family: <b>${metadata[index]?.properties?.malware_family ?? "N/A"}</b><br>Coords: [${point
              .slice(0, 3)
              .map((c) => c.toFixed(2))
              .join(", ")}]`,
        ),
        customdata: data.map((_, index) => index),
        mode: "markers",
        type: dimension === 3 ? "scatter3d" : "scattergl",
        marker: {
          ...commonMarkerProps,
          color: data.map((p) => p[0]),
          colorscale: "Viridis",
          colorbar: {
            title: {
              text: "Component 1",
              font: { size: 10 },
            },
            tickfont: { size: 8 },
            thickness: 15,
            len: 0.75,
            y: 0.5,
          },
        },
        ...commonHoverProps,
      },
    ] as Data[];
  }

  if (colorBy === "family" || colorBy === "reporter") {
    const keyExtractor =
      colorBy === "family"
        ? (m: MalwareMetadata) => m.properties?.malware_family
        : (m: MalwareMetadata) => m.properties?.reporter;
    const groupedData = groupDataForTraces(data, metadata, keyExtractor);
    const traces = Object.entries(groupedData).map(([key, group]) => ({
      x: group.points.map((p) => p[0]),
      y: group.points.map((p) => p[1]),
      z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
      name: group.originalName,
      text: group.indices.map(
        (originalIndex) =>
          `Family: <b>${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}</b><br>Reporter: ${metadata[originalIndex]?.properties?.reporter ?? "N/A"}<br>Coords: [${data[
            originalIndex
          ]
            ?.slice(0, 3)
            .map((c) => c.toFixed(2))
            .join(", ")}]`,
      ),
      customdata: group.indices,
      mode: "markers",
      type: dimension === 3 ? "scatter3d" : "scattergl",
      marker: {
        ...commonMarkerProps,
        color: key === "unknown" ? "#cccccc" : stringToColor(key),
      },
      ...commonHoverProps,
    }));
    traces.sort((a, b) =>
      a.name === "Unknown"
        ? 1
        : b.name === "Unknown"
          ? -1
          : a.name.localeCompare(b.name),
    );
    baseTraces = traces as Data[];
  }

  if (colorBy === "cluster") {
    const groupedData = groupDataForTraces(data, metadata, (m) =>
      m.cluster_label != null && m.cluster_label >= 0
        ? `Cluster ${m.cluster_label}`
        : "Unclustered",
    );
    const traces = Object.entries(groupedData).map(([key, group]) => ({
      x: group.points.map((p) => p[0]),
      y: group.points.map((p) => p[1]),
      z: dimension === 3 ? group.points.map((p) => p[2]) : undefined,
      name: group.originalName,
      text: group.indices.map(
        (originalIndex) =>
          `Cluster: <b>${metadata[originalIndex]?.cluster_label ?? "N/A"}</b><br>Family: ${metadata[originalIndex]?.properties?.malware_family ?? "N/A"}<br>Coords: [${data[
            originalIndex
          ]
            ?.slice(0, 3)
            .map((c) => c.toFixed(2))
            .join(", ")}]`,
      ),
      customdata: group.indices,
      mode: "markers",
      type: dimension === 3 ? "scatter3d" : "scattergl",
      marker: {
        ...commonMarkerProps,
        color:
          key === "unclustered"
            ? "#cccccc"
            : getDistinctColor(
                parseInt(group.originalName.replace("Cluster ", "")),
              ),
      },
      ...commonHoverProps,
    }));
    traces.sort((a, b) =>
      a.name === "Unclustered"
        ? 1
        : b.name === "Unclustered"
          ? -1
          : parseInt(a.name.replace("Cluster ", "")) -
            parseInt(b.name.replace("Cluster ", "")),
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
