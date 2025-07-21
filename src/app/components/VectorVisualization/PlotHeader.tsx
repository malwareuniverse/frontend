import React from "react";
import type { InteractionMode } from "./types";

interface PlotHeaderProps {
  statusMessage: string;
  interactionMode?: InteractionMode;
  onInteractionToggle?: () => void;
}

export default function PlotHeader({
  statusMessage,
  interactionMode,
  onInteractionToggle,
}: PlotHeaderProps) {
  const statusColor = statusMessage.startsWith("Error")
    ? "bg-red-500"
    : statusMessage.startsWith("Loading") ||
        statusMessage.includes("No data") ||
        statusMessage.includes("not in a plottable")
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${statusColor}`}></div>
        <p className="text-sm text-gray-600">{statusMessage}</p>
      </div>

      {onInteractionToggle && interactionMode && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span
            className={
              interactionMode === "multiselect"
                ? "font-semibold"
                : "text-gray-400"
            }
          >
            Multi-Select
          </span>
          <button
            onClick={onInteractionToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${
              interactionMode === "isolate" ? "bg-indigo-600" : "bg-gray-400"
            }`}
            type="button"
            aria-label={`Switch to ${interactionMode === "isolate" ? "Multi-Select" : "Isolate"} mode`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                interactionMode === "isolate"
                  ? "translate-x-5"
                  : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={
              interactionMode === "isolate" ? "font-semibold" : "text-gray-400"
            }
          >
            Isolate
          </span>
        </div>
      )}
    </div>
  );
}
