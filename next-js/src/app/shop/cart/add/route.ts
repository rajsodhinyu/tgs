import { redirect } from "next/navigation";
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cookies } from "next/headers";



const client = createStorefrontApiClient({
    storeDomain: 'http://d83529-c9.myshopify.com',
    apiVersion: '2024-04',
    publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});



export async function GET(request: Request) {
    const cookieStore = await cookies()

    console.log(`received ${request.url}`)
    const action = request.url.split("&")[1].split("=")[1]
    console.log(`action is ${action}`)
    const actionlessURL = request.url.split("&")[0]
    const product = `gid://shopify/ProductVariant/${actionlessURL.split("?")[1].split("=")[1]}`
    console.log(`hoodie ${product} added to cart`);



    const newEmptyCart = `
    mutation {
  cartCreate(input: {lines: []}) {
    cart {
      id
    }
  }
}`

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

    let finalURL = '/shop'

    console.log(cookieStore.getAll('cart'))
    const cartbool = cookieStore.has('cart')
    console.log(cartbool)
    let currentCart = cookieStore.get('cart')
    console.log(`current cart is ${currentCart?.value}`)
    if ((currentCart?.value == '') || (!cartbool) || (action == 'now')) { /* if there is no cart (very unlikely) */
        const { data } = await client.request(newCartwithItem, {
            variables: {
                handle: 'sample-product',
            },
        });
        const cart = data.cartCreate.cart.id
        const cartCookie = cookieStore.set('cart', cart)
        console.log(`added new cart ${cart} to cookies`)
        finalURL = data.cartCreate.cart.checkoutUrl
    }
    else {
        const addItemtoCart = `
                mutation {
  cartLinesAdd(
    cartId: "${currentCart?.value}"
    lines: {merchandiseId: "${product}"}
  ) {
    cart {
      id
      checkoutUrl
    }
  }
}
    `
        const { data } = await client.request(addItemtoCart, {
            variables: {
                handle: 'sample-product',
            },
        });

        finalURL = `${data.cartLinesAdd.cart.checkoutUrl}`
    }


    if (action == "now") {
        redirect(finalURL)
    }
    else { redirect('/shop/cart/') }

}

