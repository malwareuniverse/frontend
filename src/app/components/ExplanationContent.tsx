import {
  Waypoints,
  Server,
  Cpu,
  ArrowLeftRight,
  BarChart3,
  Info,
  MousePointer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Data remains the same
const workflowSteps: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  // ... your workflowSteps array ...
  {
    title: "Frontend (You are here)",
    description: "A user selects options like the dimensionality reduction (DR) method (PaCMAP, UMAP, etc.) and clicks 'Fetch Data'.",
    Icon: MousePointer,
  },
  {
    title: "API Proxy (Next.js)",
    description: "The browser sends a request to a Next.js API route (/api/fastapi-data), which acts as a secure intermediary.",
    Icon: Waypoints,
  },
  {
    title: "Backend (FastAPI)",
    description: "The Next.js API route forwards the request to the main FastAPI backend service, passing along the user's chosen DR parameters.",
    Icon: Server,
  },
  {
    title: "Data Processing",
    description: "The FastAPI backend queries a vector database (e.g., Weaviate) and applies the chosen DR algorithm if requested.",
    Icon: Cpu,
  },
  {
    title: "Response",
    description: "The processed, lower-dimensional data is sent back through the Next.js API route to the frontend.",
    Icon: ArrowLeftRight,
  },
  {
    title: "Visualization",
    description: "The frontend uses a library to render the data as an interactive scatter plot.",
    Icon: BarChart3,
  },
];


export function ExplanationContent() {
  return (
    <div className="space-y-8">
      {/* Section 1: What this App Does (Unchanged) */}
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-800">
            What This App Does
          </h4>
          <p className="mt-1 text-sm text-gray-600">
            This application is an interactive visualizer for malware analysis. It helps security analysts identify clusters, discover new malware families, and spot anomalies by visualizing high-dimensional data in 2D or 3D.
          </p>
        </div>
      </div>

      {/* Section 2: How It Works (The Fix) */}
      <div>
        <h4 className="mb-4 text-base font-semibold text-gray-800">
          Steps it takes
        </h4>
        {/* We keep the timeline on the parent, but remove the broken space-y */}
        <div className="border-l-2 border-gray-200">
          {workflowSteps.map((step, index) => (
            // 1. The container for EACH step is now the relative parent
            <div key={index} className="relative flex items-start gap-4">
              {/* 2. We use padding for spacing, not margin. This makes the relative container taller. */}
              {/* We add padding-left to the content, and padding-bottom to create the space. */}
              <div className="flex-grow pl-4 pb-8">
                <h5 className="font-semibold text-gray-800">{step.title}</h5>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
              </div>
               <div className="absolute -left-1 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}