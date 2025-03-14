import { redirect } from "next/navigation";
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cookies } from "next/headers";

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
  const cookie = await cookies()
  const cookieStore = cookie
  let action
  action = request.url.split("&")[0].split("?")[1].split("=")[1]
  let currentCart;
  if (action == 'clear') {
    cookieStore.delete('cart')
    const { data } = await client.request(newEmptyCart, {
      variables: {
          handle: 'sample-product',
      },
  });
    currentCart = cookieStore.set('cart', data.cartCreate.cart.id)

    redirect('/shop/cart/')
  }
  
      const product = `gid://shopify/ProductVariant/${action}`
      currentCart = cookieStore.get('cart')
      let cartbool = cookieStore.has('cart')
      if (cartbool) {
        console.log(`found ${currentCart?.value}`)
        const addItemtoCart = `mutation {
  cartLinesAdd(
    cartId: "${currentCart?.value}"
    lines: {merchandiseId: "${product}"}
  ) {
    cart {
      id
      checkoutUrl
    }
  }
}`
        const { data } = await client.request(addItemtoCart, {
            variables: {
                handle: 'sample-product',
            },
        });
      }
      else {
        console.log('building new cart')
        const newCartwithItem = `mutation {
          cartCreate(
            input: {lines: [{quantity: 1, merchandiseId: "${product}"}]}
          ) {
            cart {
              id
              createdAt
              updatedAt
              lines(first: 10) {
                edges {
                  node {
                    id
                    merchandise {
                      ... on ProductVariant {
                        id
                      }
                    }
                  }
                }
              }
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalTaxAmount {
                  amount
                  currencyCode
                }
                totalDutyAmount {
                  amount
                  currencyCode
                }
              }
              checkoutUrl
            }
          }
        }`;
        const { data } = await client.request(newCartwithItem, {
          variables: {
              handle: 'sample-product',
          },
      });
        cookieStore.set('cart', data.cartCreate.cart.id)
        currentCart = data.cartCreate.cart.id
        console.log(`new cart: ${currentCart?.value}`)
      }
      redirect('/shop/cart/')

  
}