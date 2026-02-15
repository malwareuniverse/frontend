/**
 * Improved color utilities for better visual differentiation in scatter plots.
 * Uses perceptually uniform color spaces and maximally distinct palettes.
 */

/**
 * A curated palette of 30 maximally distinct colors.
 * These are chosen to be distinguishable even for colorblind users (where possible)
 * and avoid similar shades clustering together.
 */
const DISTINCT_PALETTE = [
  "#e6194b", // Red
  "#3cb44b", // Green
  "#4363d8", // Blue
  "#f58231", // Orange
  "#911eb4", // Purple
  "#46f0f0", // Cyan
  "#f032e6", // Magenta
  "#bcf60c", // Lime
  "#fabebe", // Pink
  "#008080", // Teal
  "#e6beff", // Lavender
  "#9a6324", // Brown
  "#fffac8", // Beige
  "#800000", // Maroon
  "#aaffc3", // Mint
  "#808000", // Olive
  "#ffd8b1", // Apricot
  "#000075", // Navy
  "#808080", // Grey
  "#000000", // Black
  "#ffe119", // Yellow
  "#42d4f4", // Sky blue
  "#bfef45", // Yellow-green
  "#fabed4", // Light pink
  "#469990", // Dark cyan
  "#dcbeff", // Light purple
  "#9A4B2A", // Rust
  "#2F6B3A", // Forest
  "#6B3A6B", // Plum
  "#3A6B6B", // Dark teal
];

/**
 * Extended palette using golden angle distribution in HSL space
 * for when we need more than 30 colors.
 */
function generateGoldenAngleColor(index: number): string {
  // Golden angle in degrees ≈ 137.508°
  const goldenAngle = 137.508;
  const hue = (index * goldenAngle) % 360;

  // Vary saturation and lightness to add more distinction
  const saturationBand = index % 3;
  const lightnessBand = Math.floor(index / 3) % 3;

  const saturation = 65 + saturationBand * 15; // 65%, 80%, 95%
  const lightness = 35 + lightnessBand * 15; // 35%, 50%, 65%

  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to hex color string.
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a distinct color by index.
 * Uses the curated palette first, then falls back to golden angle generation.
 */
export function getDistinctColor(index: number): string {
  if (index < 0) return "#cccccc";
  if (index < DISTINCT_PALETTE.length) {
    return DISTINCT_PALETTE[index]!;
  }
  return generateGoldenAngleColor(index - DISTINCT_PALETTE.length);
}

/**
 * Improved string-to-color mapping that ensures consistent but well-distributed colors.
 * Uses a deterministic hash but maps to the distinct palette.
 */
export function stringToColor(str: string): string {
  if (!str) return "#cccccc";

  // Simple but effective hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Map hash to a positive index
  const index = Math.abs(hash) % 1000;

  // Use distinct palette with golden angle fallback
  return getDistinctColor(index % (DISTINCT_PALETTE.length * 3));
}

/**
 * Color manager class for tracking assigned colors across multiple calls.
 * This ensures that within a single visualization, colors are assigned
 * sequentially from the distinct palette rather than via hash.
 */
export class ColorManager {
  private assignedColors: Map<string, string> = new Map();
  private nextIndex = 0;

  getColor(key: string): string {
    if (key === "unknown" || key === "unclustered") {
      return "#cccccc";
    }

    const existing = this.assignedColors.get(key.toLowerCase());
    if (existing) {
      return existing;
    }

    const color = getDistinctColor(this.nextIndex);
    this.assignedColors.set(key.toLowerCase(), color);
    this.nextIndex++;
    return color;
  }

  reset(): void {
    this.assignedColors.clear();
    this.nextIndex = 0;
  }
}

/**
 * Group data for traces (unchanged from original, included for completeness).
 */
export function groupDataForTraces<T>(
  data: number[][],
  metadata: T[],
  keyExtractor: (m: T) => string | undefined,
  originalIndices?: number[]
): Record<
  string,
  { points: number[][]; indices: number[]; originalName: string }
> {
  const groups: Record<
    string,
    { points: number[][]; indices: number[]; originalName: string }
  > = {};

  metadata.forEach((meta, i) => {
    const rawKey = keyExtractor(meta);
    const originalName = rawKey ?? "Unknown";
    const normalizedKey = (rawKey ?? "unknown").toLowerCase();
    const point = data[i];
    const originalIndex = (originalIndices ? originalIndices[i] : i ) ?? 0;

    if (point) {
      if (!groups[normalizedKey]) {
        groups[normalizedKey] = { points: [], indices: [], originalName };
      }
      groups[normalizedKey].points.push(point);
      groups[normalizedKey].indices.push(originalIndex);
    }
  });

  return groups;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}