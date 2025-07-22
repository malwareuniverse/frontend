'use client';

import { useState, useEffect } from 'react';
import type { CollectionsApiResponse } from '~/interfaces/api';

export function useWeaviateCollections() {
  const [collections, setCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = new URL('/api/weaviate-collections', window.location.origin);
        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch collections from the server. Status: ${response.status}. Message: ${errorText}`);
        }

        const data: CollectionsApiResponse = await response.json() as CollectionsApiResponse;
        const collectionNames = Object.values(data.collections);
        setCollections(collectionNames);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Failed to fetch Weaviate collections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCollections();

  }, []);

  return { collections, isLoading, error };
}