'use client';

import { useState, useEffect } from 'react';
import type { SelectedPointInfo } from '~/app/components/VectorVisualization/types';

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
      <div className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">
          Selected Point Details
        </h2>
        <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
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
    <div className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">
        Selected Point Details
      </h2>
      <div className="max-h-[28rem] space-y-2.5 overflow-y-auto pr-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Family:</span>
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {properties.malware_family ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Cluster:</span>
          <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
            {metadata.cluster_label ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">File Name:</span>
          <span className="ml-2 font-mono text-xs break-all text-gray-600">
            {properties.file_name ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">SHA256:</span>
          <span className="ml-2 font-mono text-xs break-all text-gray-600">
            {properties.sha256_hash ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">File Type:</span>
          <span className="ml-2 text-gray-900">
            {properties.file_type ?? 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">File Size:</span>
          <span className="ml-2 text-gray-900">
            {properties.file_size
              ? `${properties.file_size.toLocaleString()} bytes`
              : 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Reporter:</span>
          <span className="ml-2 text-gray-900">
            {properties.reporter ?? 'N/A'}
          </span>
        </div>

        {opcode && (
          <div>
            <span className="font-semibold text-gray-700">Opcode:</span>
            <div
              className="mt-1 cursor-pointer font-mono text-xs break-words text-gray-600"
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

        <div className="!mt-4 border-t border-gray-200 pt-3">
          <span className="font-semibold text-gray-700">UUID:</span>
          <span className="ml-2 block font-mono text-xs break-all text-gray-600">
            {metadata.uuid}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Vec Length:</span>
          <span className="ml-2 text-gray-900">{metadata.vector_length}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Coords:</span>
          <span className="ml-2 text-gray-900">
            [{coordinates.map((c: number) => c.toFixed(3)).join(', ')}]
          </span>
        </div>
      </div>
    </div>
  );
}