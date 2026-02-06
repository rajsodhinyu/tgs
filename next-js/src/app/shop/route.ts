import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { shopifyClient as client } from '@/lib/shopify';


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