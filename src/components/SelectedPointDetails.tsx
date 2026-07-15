'use client';

import { useState, useEffect } from 'react';
import type { SelectedPointInfo } from '~/components/VectorVisualization/types';

interface SelectedPointDetailsProps {
  selectedPoint: SelectedPointInfo | null;
}

export default function SelectedPointDetails({
  selectedPoint,
}: SelectedPointDetailsProps) {
  const [isOpcodeExpanded, setIsOpcodeExpanded] = useState(false);

  useEffect(() => {
    setIsOpcodeExpanded(false);
  }, [selectedPoint]);

  if (!selectedPoint) {
    return (
      <div className="space-y-4 rounded-lg bg-white dark:bg-slate-800 p-6 shadow border border-transparent dark:border-slate-700/50">
        <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
          Selected Point Details
        </h2>
        <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-200 dark:border-slate-700 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
          <span>Click on a point to see details.</span>
        </div>
      </div>
    );
  }

  const { metadata, coordinates } = selectedPoint;
  const { properties } = metadata;
  const opcode = properties.op_code;

  // This function checks if text is selected before toggling the view.
  const handleOpcodeClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    setIsOpcodeExpanded(!isOpcodeExpanded);
  };

  return (
    <div className="space-y-4 rounded-lg bg-white dark:bg-slate-800 p-6 shadow border border-transparent dark:border-slate-700/50">
      <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
        Selected Point Details
      </h2>
      <div className="max-h-[28rem] space-y-2.5 overflow-y-auto pr-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-355 text-gray-700 dark:text-slate-300">Family:</span>
          <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
            {properties.malware_family ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">Cluster:</span>
          <span className="ml-2 rounded-full bg-purple-100 dark:bg-purple-900/40 px-2 py-1 text-xs font-medium text-purple-800 dark:text-purple-300">
            {metadata.cluster_label ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">File Name:</span>
          <span className="ml-2 font-mono text-xs break-all text-gray-600 dark:text-slate-400">
            {properties.file_name ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">SHA256:</span>
          <span className="ml-2 font-mono text-xs break-all text-gray-600 dark:text-slate-400">
            {properties.sha256_hash ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">File Type:</span>
          <span className="ml-2 text-gray-900 dark:text-slate-200">
            {properties.file_type ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">File Size:</span>
          <span className="ml-2 text-gray-900 dark:text-slate-200">
            {properties.file_size
              ? `${properties.file_size.toLocaleString()} bytes`
              : 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">Reporter:</span>
          <span className="ml-2 text-gray-900 dark:text-slate-200">
            {properties.reporter ?? 'N/A'}
          </span>
        </div>

        {opcode && (
          <div>
            <span className="font-semibold text-gray-700 dark:text-slate-300">Opcode:</span>
            <div
              className="mt-1 cursor-pointer font-mono text-xs break-words text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={handleOpcodeClick}
              title="Click to expand/collapse"
            >
              {isOpcodeExpanded
                ? opcode
                : `${opcode.substring(0, 50)}${
                    opcode.length > 50 ? '...' : ''
                  }`}
            </div>
          </div>
        )}

        <div className="!mt-4 border-t border-gray-200 dark:border-slate-700 pt-3">
          <span className="font-semibold text-gray-700 dark:text-slate-300">UUID:</span>
          <span className="ml-2 block font-mono text-xs break-all text-gray-600 dark:text-slate-400">
            {metadata.uuid}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">Vec Length:</span>
          <span className="ml-2 text-gray-900 dark:text-slate-200">{metadata.vector_length}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">Coords:</span>
          <span className="ml-2 text-gray-900 dark:text-slate-200">
            [{coordinates.map((c: number) => c.toFixed(3)).join(', ')}]
          </span>
        </div>
      </div>
    </div>
  );
}