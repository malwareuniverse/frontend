import type { MalwareMetadata } from "~/interfaces/malware";

export type InteractionMode = "isolate" | "multiselect";

export interface VectorVisualizationProps {
  data: number[][];
  metadata: MalwareMetadata[];
  isLoading: boolean;
  colorBy: "component" | "family" | "cluster" | "reporter";
  onPointClick: (info: SelectedPointInfo | null) => void;
}

export interface SelectedPointInfo {
  metadata: MalwareMetadata;
  coordinates: number[];
}

export interface TraceVisibilityInfo {
  name: string;
  visible: boolean | "legendonly";
}

export interface PlotDataTransformerArgs {
  data: number[][];
  metadata: MalwareMetadata[];
  dimension: number;
  colorBy: VectorVisualizationProps["colorBy"];
  traceVisibility: TraceVisibilityInfo[] | null;
  isolatedItem: { type: string; value: string } | null;
}
