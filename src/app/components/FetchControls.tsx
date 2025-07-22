// src/app/components/FetchControls.tsx
"use client";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

interface FetchControlsProps {
  collection: string;
  setCollection: (value: string) => void;
  availableCollections: string[];
  isCollectionsLoading: boolean;
  collectionsError: string | null;

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
  collection,
  setCollection,
  availableCollections,
  isCollectionsLoading,
  collectionsError,
  applyDR,
  setApplyDR,
  drMethod,
  setDrMethod,
  nComponents,
  setNComponents,
  isPending,
  onFetch,
}: FetchControlsProps) {
  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-medium text-gray-900">Fetch Options</h2>

      <div className="space-y-1">
        <Listbox
          value={collection}
          onChange={setCollection}
          disabled={isCollectionsLoading || isPending || !!collectionsError}
        >
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            Data Collection
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-70">
              <span className="block truncate">
                {isCollectionsLoading
                  ? "Loading collections..."
                  : collectionsError
                  ? "Error loading collections"
                  : availableCollections.length === 0
                  ? "No collections found"
                  : collection}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {availableCollections.map((col) => (
                  <Listbox.Option
                    key={col}
                    className={({ active  }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                      }`
                    }
                    value={col}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {col}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        {collectionsError && (
          <p className="mt-2 text-xs text-red-600">{collectionsError}</p>
        )}
      </div>

      {/* Apply DR Checkbox */}
      <div className="flex items-center">
        <input
          id="apply_dr"
          type="checkbox"
          checked={applyDR}
          onChange={(e) => setApplyDR(e.target.checked)}
          disabled={isPending}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label htmlFor="apply_dr" className="ml-2 block text-sm text-gray-900">
          Apply Dimensionality Reduction
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input id="apply_pacmap" type="radio" name="dr_method" value="pacmap" checked={drMethod === 'pacmap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="apply_pacmap" className="ml-2 block text-sm text-gray-900">PaCMAP</label>
        </div>
        <div className="flex items-center">
          <input id="apply_umap" type="radio" name="dr_method" value="umap" checked={drMethod === 'umap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="apply_umap" className="ml-2 block text-sm text-gray-900">UMAP</label>
        </div>
        <div className="flex items-center">
          <input id="apply_trimap" type="radio" name="dr_method" value="trimap" checked={drMethod === 'trimap'} onChange={(e) => setDrMethod(e.target.value)} disabled={isPending || !applyDR} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="apply_trimap" className="ml-2 block text-sm text-gray-900">TriMAP</label>
        </div>
      </div>


      {applyDR && (
        <div className="mt-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">Visualization Dimensions</label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input id="pacmap_components_2" type="radio" name="pacmap_components" value="2" checked={nComponents === 2} onChange={() => setNComponents(2)} disabled={isPending} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="pacmap_components_2" className="ml-2 block text-sm text-gray-700">2D</label>
            </div>
            <div className="flex items-center">
              <input id="pacmap_components_3" type="radio" name="pacmap_components" value="3" checked={nComponents === 3} onChange={() => setNComponents(3)} disabled={isPending} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="pacmap_components_3" className="ml-2 block text-sm text-gray-700">3D</label>
            </div>
          </div>
        </div>
      )}

      <button onClick={onFetch} disabled={isPending || isCollectionsLoading || !!collectionsError} className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
        {isPending ? (
          <><svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</>
        ) : (
          "Fetch Data"
        )}
      </button>
    </div>
  );
}