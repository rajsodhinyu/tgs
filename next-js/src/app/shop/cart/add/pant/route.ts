import { redirect } from "next/navigation";
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cookies } from "next/headers";


const client = createStorefrontApiClient({
  storeDomain: 'http://d83529-c9.myshopify.com',
  apiVersion: '2024-04',
  publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});

export async function GET(request: Request) {
  console.log(localStorage.getItem('cart'))
  console.log('pant added to cart');  
  const product = `gid://shopify/ProductVariant/${request.url.split("?")[1].split("=")[1]}`
  console.log(product)
  const mutationQ = `mutation {
  cartCreate(
    input: {
      lines: [
        {
          quantity: 1
          merchandiseId: "${product}"
        }
      ],
    }
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
      # The estimated total cost of all merchandise that the customer will pay at checkout.
      cost {
        totalAmount {
          amount
          currencyCode
        }
        # The estimated amount, before taxes and discounts, for the customer to pay at checkout.
        subtotalAmount {
          amount
          currencyCode
        }
        # The estimated tax amount for the customer to pay at checkout.
        totalTaxAmount {
          amount
          currencyCode
        }
        # The estimated duty amount for the customer to pay at checkout.
        totalDutyAmount {
          amount
          currencyCode
        }
      }
    }
  }
}`;

  const { data } = await client.request(mutationQ, {
    variables: {
      handle: 'sample-product',
    },
  });

  const cookieStore = await cookies()
  const cart = data.cartCreate.cart.id

  const cartCookie = cookieStore.set('cart', cart)
  console.log(`adding ${cart} to cookies`)




  redirect('/shop/cart')
  }