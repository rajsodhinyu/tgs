import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createStorefrontApiClient } from '@shopify/storefront-api-client';




const client = createStorefrontApiClient({
    storeDomain: 'http://d83529-c9.myshopify.com',
    apiVersion: '2024-04',
    publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});


const newEmptyCart = `
mutation {
  cartCreate(input: {lines: []}) {
    cart {
      id
    }
  }
}`

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');
  const finalURL = returnTo?.startsWith('/shop') ? returnTo : '/shop/home';

  const cookieStore = await cookies()
  const currentCart = cookieStore.get('cart')

  if (!currentCart?.value || returnTo) {
      const { data } = await client.request(newEmptyCart);
      cookieStore.set('cart', data.cartCreate.cart.id)
  }

  redirect(finalURL)
}