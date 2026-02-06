import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: '2024-04',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN!,
});

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

const GET_PRODUCT = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      title
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function getProduct(handle: string): Promise<Variant[]> {
  const { data } = await shopifyClient.request(GET_PRODUCT, {
    variables: { handle },
  });
  return data.product.variants.edges.map((edge: any) => edge.node);
}
