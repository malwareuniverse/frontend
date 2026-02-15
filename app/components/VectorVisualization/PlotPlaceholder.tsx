import React from "react";

interface PlotPlaceholderProps {
  statusMessage: string;
}

export default function PlotPlaceholder({
  statusMessage,
}: PlotPlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="mx-auto h-10 w-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.25-2.25M3 15l2.25 2.25m0 0l3-3m0-3l3.75-3.75M9 15l3-3m0 0l9-9m-3 3l3-3m-8.25 8.25L12 17.25m0 0l4.5 4.5M7.5 15h2.25m2.25 0H15m-3 6l3-3m2.25 0l4.5 4.5M17.25 16.5L20.25 19.5M16.5 18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0016.5 4.5H7.5A2.25 2.25 0 005.25 6.75v9A2.25 2.25 0 007.5 18h9z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-500">{statusMessage}</p>
    </div>
  );
}
