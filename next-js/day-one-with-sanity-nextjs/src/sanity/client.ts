import "server-only";

import { createClient, type QueryParams } from "next-sanity";

export const client = createClient({
  projectId: "fnvy29id",
  dataset: "tgs",
  apiVersion: "2024-01-01",
  useCdn: false,
});

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}) {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 30 : 60,
      tags,
    },
  });
}