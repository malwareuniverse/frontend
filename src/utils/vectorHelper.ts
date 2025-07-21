// this isn't perfect practice, they should be in separate files, but this is easier here

import type {MalwareMetadata} from "~/interfaces/malware";

export function stringToColor(str: string) {
    let hash = 0;
    const lowerStr = str.toLowerCase();
    for (let i = 0; i < lowerStr.length; i++) {
        hash = lowerStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

export function getDistinctColor(index: number) {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

export function groupDataForTraces(
    data: number[][],
    metadata: MalwareMetadata[],
    keyExtractor: (meta: MalwareMetadata) => string | null,
    originalIndices?: number[]
) {
    const grouped: Record<string, {
        points: number[][];
        indices: number[];
        originalName: string;
    }> = {};

    data.forEach((point, index) => {
        const meta = metadata[index];
        if (!meta) return;
        const originalName = keyExtractor(meta) ?? 'Unknown';
        const lowerCaseKey = originalName.toLowerCase();
        grouped[lowerCaseKey] ??= { points: [], indices: [], originalName: originalName };
        grouped[lowerCaseKey].points.push(point);
        const indexToPush: number = (originalIndices ? originalIndices[index] : index)!;
        grouped[lowerCaseKey].indices.push(indexToPush);
    });
    return grouped;
}

export function isNumber(value: unknown): value is number {
  return value !== null && typeof value === 'number' && isFinite(value);
}
