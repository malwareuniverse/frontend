'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, PlotMouseEvent, Layout } from "plotly.js";

const Plot = dynamic(
  () => import('react-plotly.js'),
  { ssr: false }
);

interface MalwareMetadata {
    properties: {
        malware_family: string | null;
    };
    uuid: string;
    vector_length: number;
}

export interface SelectedPointInfo {
    metadata: MalwareMetadata;
    coordinates: number[];
}

interface VectorVisualizationProps {
  data: number[][];
  metadata: MalwareMetadata[];
  isLoading: boolean;
  colorBy: 'component' | 'family';
  onPointClick: (info: SelectedPointInfo | null) => void;
}

function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const saturation = 70;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function VectorVisualization({ data, metadata, isLoading, colorBy = 'component', onPointClick }: VectorVisualizationProps) {

  const dimension = useMemo(() => {
    if (!data || data.length === 0 || data[0] === undefined) return 0;
    const derivedDim = data[0].length;
    if (derivedDim >= 2 && derivedDim <= 3) return derivedDim;
    return 0;
  }, [data]);

  const plotKey = useMemo(() => {
    if (!data || data.length === 0) return 'no-data';
    return `plot-${dimension}-${colorBy}-${data.length}`;
  }, [dimension, colorBy, data]);

  const plotlyData = useMemo(() => {
    if (!data || data.length === 0 || !metadata || data.length !== metadata.length || dimension < 2 || dimension > 3) {
      return null;
    }
    console.log(colorBy)
    if (colorBy === 'component') {
        const xCoords = data.map(point => point[0]);
        const yCoords = data.map(point => point[1]);
        const zCoords = dimension === 3 ? data.map(point => point[2]) : undefined;
        const hoverTexts = data.map((point, index) => {
            const family = metadata[index]?.properties?.malware_family ?? 'N/A';
            let coordsText = `[${point[0]?.toFixed(2) ?? 'N/A'}, ${point[1]?.toFixed(2) ?? 'N/A'}`;
            if (dimension === 3 && point[2] !== undefined) {
                coordsText += `, ${point[2]?.toFixed(2) || 'N/A'}`;
            }
            coordsText += ']';
            return `Family: <b>${family}</b><br>Coords: ${coordsText}`;
        });
        const colors = data.map(point => point[0]);
        const trace = {
          x: xCoords,
          y: yCoords,
          z: zCoords,
          text: hoverTexts,
          customdata: data.map((_, index) => index),
          mode: 'markers',
          type: dimension === 3 ? 'scatter3d' : 'scattergl',
          marker: {
            color: colors,
            colorscale: 'Viridis',
            colorbar: {
              title: 'Component 1',
              thickness: 15,
              len: 0.75,
              y: 0.5,
              titlefont: { size: 10 },
              tickfont: { size: 8 },
            },
            size: dimension === 3 ? 4 : 6,
            opacity: 0.8,
          },
          hoverinfo: 'text',
          hoverlabel: { bgcolor: 'white', font: { size: 10 } },
        };
        return [trace] as Data[];
    }

    if (colorBy === 'family') {
        const groupedData: Record<string, { points: number[][]; indices: number[] }> = {};
        data.forEach((point, index) => {
            const family = metadata[index]?.properties?.malware_family ?? 'Unknown';
            groupedData[family] ??= { points: [], indices: [] };
            groupedData[family].points.push(point);
            groupedData[family].indices.push(index);
        });

        const traces = Object.keys(groupedData).map((family: string) => {
            const group = groupedData[family];
            if (!group) return null;
            const xCoords = group.points.map(p => p[0]);
            const yCoords = group.points.map(p => p[1]);
            const zCoords = dimension === 3 ? group.points.map(p => p[2]) : undefined;
            const hoverTexts = group.indices.map(originalIndex => {
                const point = data[originalIndex];
                if (!point) return undefined;
                const familyName = metadata[originalIndex]?.properties?.malware_family ?? 'N/A';
                let coordsText = `[${point[0]?.toFixed(2) ?? 'N/A'}, ${point[1]?.toFixed(2) ?? 'N/A'}`;
                if (dimension === 3 && point[2] !== undefined) {
                    coordsText += `, ${point[2]?.toFixed(2) || 'N/A'}`;
                }
                coordsText += ']';
                return `Family: <b>${familyName}</b><br>Coords: ${coordsText}`;
            });
            const color = family === 'Unknown' ? '#cccccc' : stringToColor(family);
            return {
                x: xCoords,
                y: yCoords,
                z: zCoords,
                name: family,
                text: hoverTexts,
                customdata: group.indices,
                mode: 'markers',
                type: dimension === 3 ? 'scatter3d' : 'scattergl',
                marker: { color: color, size: dimension === 3 ? 4 : 6, opacity: 0.8, },
                hoverinfo: 'text',
                hoverlabel: { bgcolor: 'white', font: { size: 10 } },
            };
        });
        traces.sort((a, b) => {
            if (!a || !b) return 0;
            return a.name === 'Unknown' ? 1 : b.name === 'Unknown' ? -1 : a.name.localeCompare(b.name)
        });
        return traces.filter(Boolean) as Data[];
    }

    return null;
  }, [data, dimension, metadata, colorBy]);

  const statusMessage = useMemo(() => {
        if (isLoading) return 'Loading data...';
        if (!data || data.length === 0) return 'No data available. Fetch data first.';
        if (!metadata || data.length !== metadata.length) return 'Error: Data and metadata mismatch.';
        if (dimension === 0) return 'Data is not in a plottable format (requires array of arrays).';
        if (dimension < 2 || dimension > 3) {
            return `Data is ${dimension}D. Visualization requires 2D or 3D data (from PaCMAP).`;
        }
        return `${data.length} points visualized (${dimension}D)`;
   }, [isLoading, data, dimension, metadata]);

  const layout = useMemo<Partial<Layout>>(() => {
    return {
      autosize: true,
      margin: { l: 20, r: 20, b: 20, t: 40, pad: 4 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: '#f8f9fa',
      font: { family: 'sans-serif', color: '#343a40' },
      hovermode: 'closest',
      showlegend: colorBy === 'family',
      legend: {
        x: 1, y: 1, xanchor: 'right', yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)', bordercolor: '#dee2e6',
        borderwidth: 1, font: { size: 10 },
      },
      xaxis: {
        title: 'Component 1', gridcolor: '#e9ecef',
        zerolinecolor: '#ced4da', zerolinewidth: 1.5,
      },
      yaxis: {
        title: 'Component 2', gridcolor: '#e9ecef',
        zerolinecolor: '#ced4da', zerolinewidth: 1.5,
      },
      scene: {
        xaxis: {
          title: 'Comp. 1', titlefont: { size: 10, color: '#6c757d' },
          gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', zerolinewidth: 2,
          showbackground: false,
        },
        yaxis: {
          title: 'Comp. 2', titlefont: { size: 10, color: '#6c757d' },
          gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', zerolinewidth: 2,
          showbackground: false,
        },
        zaxis: {
          title: 'Comp. 3', titlefont: { size: 10, color: '#6c757d' },
          gridcolor: '#dee2e6', zerolinecolor: '#adb5bd', zerolinewidth: 2,
          showbackground: false,
        },
      },
    };
  }, [colorBy]);

  const handleClick = (event: Readonly<PlotMouseEvent>) => {
      if (event.points.length > 0) {
      const point = event.points[0];
      const originalIndex = point?.customdata as number;

      if (originalIndex !== undefined && metadata[originalIndex] && data[originalIndex]) {
        onPointClick({
          metadata: metadata[originalIndex],
          coordinates: data[originalIndex],
        });
      }
    } else {
      onPointClick(null);
    }
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
          <div className={`h-2 w-2 rounded-full ${statusMessage.startsWith('Error') ? 'bg-red-500' : statusMessage.startsWith('Loading') || statusMessage.startsWith('No data') || statusMessage.includes('requires 2D or 3D') || statusMessage.includes('plottable format') ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>
      </div>

       <div className="flex-grow w-full">
        {plotlyData && (
          <Plot
            key={plotKey}
            data={plotlyData}
            onClick={handleClick}
            layout={layout}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
          />
        )}
      </div>
    </div>
  );
}