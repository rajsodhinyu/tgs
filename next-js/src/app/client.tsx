import "server-only";

import { createClient, type QueryParams } from "next-sanity";

export const client = createClient({
    projectId: "fnvy29id",
    dataset: "tgs",
    apiVersion: "2024-01-01",
    useCdn: true,
  });

export async function sanityFetch<QueryResponse>({
    query,
    params = {},
    tags,
    revalidate,
  }: {
    query: string;
    params?: QueryParams;
    tags?: string[];
    /** Override ISR window (seconds). Pass 0 for always-fresh (no caching). */
    revalidate?: number;
  }) {
    return client.fetch<QueryResponse>(query, params, {
      next: {
        revalidate:
          revalidate ?? (process.env.NODE_ENV === 'development' ? 30 : 60),
        tags,
      },
    });
  }

