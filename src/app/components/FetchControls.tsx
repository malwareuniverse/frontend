'use client';

interface FetchControlsProps {
  applyDR: boolean;
  setApplyDR: (value: boolean) => void;
  drMethod: string;
  setDrMethod: (value: string) => void;
  nComponents: number;
  setNComponents: (value: number) => void;
  isPending: boolean;
  onFetch: () => void;
}

export default function FetchControls({
  applyDR, setApplyDR, drMethod, setDrMethod, nComponents, setNComponents, isPending, onFetch
}: FetchControlsProps) {
  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Fetch Options</h2>
      {/* Apply DR Checkbox */}
      <div className="flex items-center">
        <input id="apply_dr" type="checkbox" checked={applyDR} onChange={(e) => setApplyDR(e.target.checked)} disabled={isPending} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50" />
        <label htmlFor="apply_dr" className="ml-2 block text-sm text-gray-900">Apply Dimensionality Reduction</label>
      </div>

      {/* DR Method Radios */}
      <div className="flex flex-col items-start space-y-2">
        {/* PaCMAP */}
        <div className="flex items-center"><input id="apply_pacmap" type="radio" name="dr_method" value="pacmap" checked={drMethod === 'pacmap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4" /><label htmlFor="apply_pacmap" className="ml-2 block text-sm text-gray-900">PaCMAP</label></div>
        {/* UMAP */}
        <div className="flex items-center"><input id="apply_umap" type="radio" name="dr_method" value="umap" checked={drMethod === 'umap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4" /><label htmlFor="apply_umap" className="ml-2 block text-sm text-gray-900">UMAP</label></div>
        {/* TriMAP */}
        <div className="flex items-center"><input id="apply_trimap" type="radio" name="dr_method" value="trimap" checked={drMethod === 'trimap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4" /><label htmlFor="apply_trimap" className="ml-2 block text-sm text-gray-900">TriMAP</label></div>
      </div>

      {/* Dimensions Radios */}
      {applyDR && (
        <div className="mt-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">Visualization Dimensions</label>
          <div className="flex space-x-4">
            <div className="flex items-center"><input id="pacmap_components_2" type="radio" name="pacmap_components" value="2" checked={nComponents === 2} onChange={() => setNComponents(2)} disabled={isPending} className="h-4 w-4" /><label htmlFor="pacmap_components_2" className="ml-2 block text-sm text-gray-700">2D</label></div>
            <div className="flex items-center"><input id="pacmap_components_3" type="radio" name="pacmap_components" value="3" checked={nComponents === 3} onChange={() => setNComponents(3)} disabled={isPending} className="h-4 w-4" /><label htmlFor="pacmap_components_3" className="ml-2 block text-sm text-gray-700">3D</label></div>
          </div>
        </div>
      )}

      {/* Fetch Button */}
      <button onClick={onFetch} disabled={isPending} className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
        {isPending ? (
          <><svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</>
        ) : (
          "Fetch Data"
        )}
      </button>
    </div>
  );
}