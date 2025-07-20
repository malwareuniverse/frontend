'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Data, PlotMouseEvent, Layout, LegendClickEvent } from "plotly.js";
import type {MalwareMetadata} from "~/interfaces/malware";

const Plot = dynamic(
  () => import('react-plotly.js'),
  { ssr: false }
);

export interface SelectedPointInfo {
    metadata: MalwareMetadata;
    coordinates: number[];
}

interface VectorVisualizationProps {
  data: number[][];
  metadata: MalwareMetadata[];
  isLoading: boolean;
  colorBy: 'component' | 'family' | 'cluster' | 'reporter';
  onPointClick: (info: SelectedPointInfo | null) => void;
}

// --- Helper Functions ---

function stringToColor(str: string) {
    let hash = 0;
    const lowerStr = str.toLowerCase();
    for (let i = 0; i < lowerStr.length; i++) {
        hash = lowerStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function getDistinctColor(index: number) {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}


function groupDataForTraces(
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
        // Use the original index if provided, otherwise fallback to the local index
        const indexToPush: number = (originalIndices ? originalIndices[index] : index)!;
        grouped[lowerCaseKey].indices.push(indexToPush);
    });
    return grouped;
}


export default function VectorVisualization({ data, metadata, isLoading, colorBy = 'component', onPointClick }: VectorVisualizationProps) {

  const [traceVisibility, setTraceVisibility] = useState<(boolean | 'legendonly')[] | null>(null);
  const [isolatedFamily, setIsolatedFamily] = useState<string | null>(null);
  const [familyInteraction, setFamilyInteraction] = useState<'drilldown' | 'multiselect'>('drilldown');

  useEffect(() => {
    setTraceVisibility(null);
    setIsolatedFamily(null);
    setFamilyInteraction('drilldown');
  }, [colorBy, data]);

  const dimension = useMemo(() => {
    if (!data || data.length === 0 || !data[0]) return 0;
    const derivedDim = data[0].length;
    return (derivedDim >= 2 && derivedDim <= 3) ? derivedDim : 0;
  }, [data]);

  const plotlyData = useMemo(() => {
    if (!data || !metadata || data.length !== metadata.length || dimension < 2) return null;

    if (colorBy === 'family' && familyInteraction === 'drilldown' && isolatedFamily) {


        const familyPointsData: number[][] = [];
        const familyMetadata: MalwareMetadata[] = [];
        const originalIndices: number[] = [];

        metadata.forEach((meta, index) => {
            if ((meta.properties?.malware_family ?? 'Unknown').toLowerCase() === isolatedFamily) {
                const point = data[index];
                // Ensure both point and meta are valid before including them.
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
            originalIndices
        );

        const traces = Object.entries(groupedByReporter).map(([key, group]) => ({
            x: group.points.map(p => p[0]),
            y: group.points.map(p => p[1]),
            z: dimension === 3 ? group.points.map(p => p[2]) : undefined,
            name: group.originalName,
            text: group.indices.map(originalIndex => `Reporter: <b>${metadata[originalIndex]?.properties?.reporter ?? 'N/A'}</b><br>Family: ${metadata[originalIndex]?.properties?.malware_family ?? 'N/A'}<br>Coords: [${data[originalIndex]?.slice(0, 3).map(c => c.toFixed(2)).join(', ')}]`),
            customdata: group.indices,
            mode: 'markers',
            type: dimension === 3 ? 'scatter3d' : 'scattergl',
            marker: { color: key === 'unknown' ? '#cccccc' : stringToColor(key), size: dimension === 3 ? 4 : 6, opacity: 0.8 },
            hoverinfo: 'text',
            hoverlabel: { bgcolor: 'white', font: { size: 10 } },
        }));

        traces.sort((a, b) => a.name === 'Unknown' ? 1 : b.name === 'Unknown' ? -1 : a.name.localeCompare(b.name));
        return traces as Data[];
    }

    // --- Standard Views (including family multi-select) ---
    let baseTraces: Data[] | null = null;

    if (colorBy === 'component') {
        const trace = {
            x: data.map(p => p[0]),
            y: data.map(p => p[1]),
            z: dimension === 3 ? data.map(p => p[2]) : undefined,
            text: data.map((point, index) => `Family: <b>${metadata[index]?.properties?.malware_family ?? 'N/A'}</b><br>Coords: [${point.slice(0, 3).map(c => c.toFixed(2)).join(', ')}]`),
            customdata: data.map((_, index) => index),
            mode: 'markers',
            type: dimension === 3 ? 'scatter3d' : 'scattergl',
            marker: { color: data.map(p => p[0]), colorscale: 'Viridis', colorbar: { title: 'Component 1', thickness: 15, len: 0.75, y: 0.5, titlefont: { size: 10 }, tickfont: { size: 8 } }, size: dimension === 3 ? 4 : 6, opacity: 0.8 },
            hoverinfo: 'text',
            hoverlabel: { bgcolor: 'white', font: { size: 10 } },
        };
        baseTraces = [trace] as Data[];
    }

    if (colorBy === 'family' || colorBy === 'reporter') {
        const keyExtractor = colorBy === 'family' ? (m: MalwareMetadata) => m.properties?.malware_family : (m: MalwareMetadata) => m.properties?.reporter;
        const groupedData = groupDataForTraces(data, metadata, keyExtractor);
        const traces = Object.entries(groupedData).map(([key, group]) => ({
            x: group.points.map(p => p[0]),
            y: group.points.map(p => p[1]),
            z: dimension === 3 ? group.points.map(p => p[2]) : undefined,
            name: group.originalName,
            text: group.indices.map(originalIndex => `Family: <b>${metadata[originalIndex]?.properties?.malware_family ?? 'N/A'}</b><br>Reporter: ${metadata[originalIndex]?.properties?.reporter ?? 'N/A'}<br>Coords: [${data[originalIndex]?.slice(0, 3).map(c => c.toFixed(2)).join(', ')}]`),
            customdata: group.indices,
            mode: 'markers',
            type: dimension === 3 ? 'scatter3d' : 'scattergl',
            marker: { color: key === 'unknown' ? '#cccccc' : stringToColor(key), size: dimension === 3 ? 4 : 6, opacity: 0.8 },
            hoverinfo: 'text',
            hoverlabel: { bgcolor: 'white', font: { size: 10 } },
        }));
        traces.sort((a, b) => a.name === 'Unknown' ? 1 : b.name === 'Unknown' ? -1 : a.name.localeCompare(b.name));
        baseTraces = traces as Data[];
    }

    if (colorBy === 'cluster') {
        const groupedData = groupDataForTraces(data, metadata, m => m.cluster_label !== null && m.cluster_label !== undefined && m.cluster_label >= 0 ? `Cluster ${m.cluster_label}` : 'Unclustered');
        const traces = Object.entries(groupedData).map(([key, group]) => ({
            x: group.points.map(p => p[0]),
            y: group.points.map(p => p[1]),
            z: dimension === 3 ? group.points.map(p => p[2]) : undefined,
            name: group.originalName,
            text: group.indices.map(originalIndex => `Cluster: <b>${metadata[originalIndex]?.cluster_label ?? 'N/A'}</b><br>Family: ${metadata[originalIndex]?.properties?.malware_family ?? 'N/A'}<br>Coords: [${data[originalIndex]?.slice(0, 3).map(c => c.toFixed(2)).join(', ')}]`),
            customdata: group.indices,
            mode: 'markers',
            type: dimension === 3 ? 'scatter3d' : 'scattergl',
            marker: { color: key === 'unclustered' ? '#cccccc' : getDistinctColor(parseInt(group.originalName.replace('Cluster ', ''))), size: dimension === 3 ? 4 : 6, opacity: 0.8,},
            hoverinfo: 'text',
            hoverlabel: { bgcolor: 'white', font: { size: 10 } },
        }));
        traces.sort((a, b) => {
            if (a.name === 'Unclustered') return 1;
            if (b.name === 'Unclustered') return -1;
            return parseInt(a.name.replace('Cluster ', '')) - parseInt(b.name.replace('Cluster ', ''));
        });
        baseTraces = traces as Data[];
    }

    if (!baseTraces) return null;
    if (traceVisibility) {
      return baseTraces.map((trace, i) => ({ ...trace, visible: traceVisibility[i] }));
    }
    return baseTraces;

  }, [data, dimension, metadata, colorBy, traceVisibility, isolatedFamily, familyInteraction]);

  const statusMessage = useMemo(() => {
        if (isLoading) return 'Loading data...';
        if (!data || data.length === 0) return 'No data available.';
        if (!metadata || data.length !== metadata.length) return 'Error: Data and metadata mismatch.';
        if (dimension === 0) return `Data is not in a plottable 2D/3D format.`;
        if (isolatedFamily && colorBy === 'family') {
            const pointCount = metadata.filter(m => (m.properties?.malware_family ?? '').toLowerCase() === isolatedFamily).length;
            const originalFamilyName = metadata.find(m => (m.properties?.malware_family ?? '').toLowerCase() === isolatedFamily)?.properties?.malware_family ?? isolatedFamily;
            return `${pointCount} points for family "${originalFamilyName}", colored by reporter (${dimension}D)`;
        }
        return `${data.length} points visualized (${dimension}D)`;
   }, [isLoading, data, dimension, metadata, colorBy, isolatedFamily]);

  const layout = useMemo<Partial<Layout>>(() => ({
      autosize: true,
      margin: { l: 20, r: 20, b: 20, t: 40, pad: 4 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: '#f8f9fa',
      dragmode: dimension === 2 ? 'pan' : 'turntable',
      font: { family: 'sans-serif', color: '#343a40' },
      hovermode: 'closest',
      showlegend: colorBy !== 'component',
      legend: { x: 1, y: 1, xanchor: 'right', yanchor: 'top', bgcolor: 'rgba(255, 255, 255, 0.9)', bordercolor: '#dee2e6', borderwidth: 1, font: { size: 10 } },
      scene: {
        xaxis: { title: 'Comp. 1', titlefont: { size: 10, color: '#6c757d' }, gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', showbackground: false },
        yaxis: { title: 'Comp. 2', titlefont: { size: 10, color: '#6c757d' }, gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', showbackground: false },
        zaxis: { title: 'Comp. 3', titlefont: { size: 10, color: '#6c757d' }, gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', showbackground: false },
      },
  }), [colorBy, dimension]);

  const handleClick = (event: Readonly<PlotMouseEvent>) => {
    if (event.points.length > 0) {
      const point = event.points[0];
      const originalIndex = point?.customdata as number;
      if (originalIndex !== undefined && metadata[originalIndex] && data[originalIndex]) {
        onPointClick({ metadata: metadata[originalIndex], coordinates: data[originalIndex] });
      }
    } else {
      onPointClick(null);
    }
  };

  const handleLegendClick = (event: Readonly<LegendClickEvent>): boolean => {
    // Priority 1: Exit drill-down mode if it's active.
    if (isolatedFamily) {
      setIsolatedFamily(null);
      setTraceVisibility(null);
      return false;
    }

    // Priority 2: Handle special family drill-down entrance.
    if (colorBy === 'family' && familyInteraction === 'drilldown') {
      const familyName = event.data[event.curveNumber]?.name;
      if (familyName) {
        setIsolatedFamily(familyName.toLowerCase());
        setTraceVisibility(null); // Reset visibility for the new drill-down view
      }
      return false;
    }

    // Priority 3: Handle all multi-select cases ('reporter', 'cluster', and 'family' in multiselect mode).
    if (!plotlyData || plotlyData.length <= 1) {
      return false;
    }
    const clickedIndex = event.curveNumber;
    const numTraces = plotlyData.length;
    const newVisibility = traceVisibility ? [...traceVisibility] : Array(numTraces).fill('legendonly');

    newVisibility[clickedIndex] = newVisibility[clickedIndex] === true ? 'legendonly' : true;

    if (traceVisibility && traceVisibility.filter(v => v === true).length === 1 && traceVisibility[clickedIndex] === true) {
        setTraceVisibility(null);
        return false;
    }

    const isAnyTraceVisible = newVisibility.some(v => v === true);
    if (!isAnyTraceVisible) {
        setTraceVisibility(null);
        return false;
    }

    const areAllTracesVisible = newVisibility.every(v => v === true);
    if (areAllTracesVisible) {
        setTraceVisibility(null);
        return false;
    }

    setTraceVisibility(newVisibility);
    return false;
  };

  const handleFamilyModeToggle = () => {
    setIsolatedFamily(null);
    setTraceVisibility(null);
    setFamilyInteraction(prev => prev === 'drilldown' ? 'multiselect' : 'drilldown');
  };


  if (!plotlyData) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.25-2.25M3 15l2.25 2.25m0 0l3-3m0-3l3.75-3.75M9 15l3-3m0 0l9-9m-3 3l3-3m-8.25 8.25L12 17.25m0 0l4.5 4.5M7.5 15h2.25m2.25 0H15m-3 6l3-3m2.25 0l4.5 4.5M17.25 16.5L20.25 19.5M16.5 18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0016.5 4.5H7.5A2.25 2.25 0 005.25 6.75v9A2.25 2.25 0 007.5 18h9z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">{statusMessage}</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${statusMessage.startsWith('Error') ? 'bg-red-500' : statusMessage.startsWith('Loading') || statusMessage.includes('No data') || statusMessage.includes('not in a plottable') ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>

        {colorBy === 'family' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className={familyInteraction === 'multiselect' ? 'font-semibold' : 'text-gray-400'}>Multi-select</span>
            <button
              onClick={handleFamilyModeToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${familyInteraction === 'drilldown' ? 'bg-indigo-600' : 'bg-gray-400'}`}
              type="button"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${familyInteraction === 'drilldown' ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
            <span className={familyInteraction === 'drilldown' ? 'font-semibold' : 'text-gray-400'}>Single-Out</span>
          </div>
        )}
      </div>
      <div className="flex-grow w-full">
        <Plot
          data={plotlyData}
          onClick={handleClick}
          onLegendClick={handleLegendClick}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
}