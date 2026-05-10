import {
  Settings,
  MousePointerClick,
  Maximize,
  ArrowUpDown,
} from "lucide-react";

export const HowToUseContent = () => (
  <div className="space-y-4 text-gray-800">
    <ol className="list-inside list-decimal space-y-5">
      <li className="flex items-start">
        <Settings className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
        <div>
          <strong className="text-gray-900">
            Configure Visualization Controls
          </strong>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-5 text-gray-700">
            <li>
              Choose a data <strong>Collection</strong>.
            </li>
            <li>
              Set the <strong>Dimension Reduction</strong> option and target{" "}
              <strong>Dimension</strong> (2D/3D).
            </li>
          </ul>
        </div>
      </li>

      <li className="flex items-start">
        <MousePointerClick className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
        <div>
          <strong className="text-gray-900">Interact with the Plot</strong>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-5 text-gray-700">
            <li>
              <strong>Inspect details:</strong> Click any data point to see its
              information.
            </li>
            <li>
              <strong>Color the data:</strong> Use the &#34;Color By&#34; dropdown to
              change groupings.
            </li>
            <li>
              <strong>Filter via legend:</strong> Click categories in the legend
              to isolate or multi-select them. The legend corresponds to the
              current coloring mode:
              <ul className="mt-2 list-outside list-disc space-y-1 pl-7 text-gray-600">
                <li>
                  <strong>Component:</strong> Standard heatmap based on vector
                  distance.
                </li>
                <li>
                  <strong>Family:</strong> Groups by known malware family. <strong>Isolate:</strong> Source that reported selected family.
                </li>
                <li>
                  <strong>Cluster:</strong> Groups by clusters calculated via
                  HDBSCAN. <strong>Isolate:</strong> Family that belongs to selected cluster.
                </li>
                <li>
                  <strong>Reporter:</strong> Groups by the source that reported
                  the sample.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </li>

      <li className="flex items-start">
        <Maximize className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
        <div>
          <strong className="text-gray-900">Adjust the Layout</strong>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-5 text-gray-700">
            <li>
              Swap control panels using the{" "}
              <ArrowUpDown className="inline h-4 w-4" /> button.
            </li>
            <li>
              Expand the plot to full-width using its dedicated button.
            </li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
);