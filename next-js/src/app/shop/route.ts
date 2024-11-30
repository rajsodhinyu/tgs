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
  let finalURL = '/shop/home'
    const cookieStore = await cookies()
    let cartbool = cookieStore.has('cart')
    const action = request.url.split("?")[1].split("=")[1]
    console.log(`action is ${action}`)
    if (action == 'clear' ) {
      cartbool = false;
      finalURL = 'shop/cart'
    }
    let currentCart = cookieStore.get('cart')

    if ((currentCart?.value == '')||(!cartbool)) {
        const { data } = await client.request(newEmptyCart, {
            variables: {
                handle: 'sample-product',
            },
        });
        const newCartID = data.cartCreate.cart.id;




        cookieStore.set('cart', `${newCartID}`)
        let currentCart = cookieStore.get('cart')

    }
    console.log("EXITING SHOP/ HANDLER")
    redirect(finalURL)
}