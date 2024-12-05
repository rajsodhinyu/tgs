import { cookies } from "next/headers"
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import Link from "next/link";

const client = createStorefrontApiClient({
  storeDomain: 'http://d83529-c9.myshopify.com',
  apiVersion: '2024-04',
  publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});



async function getSize(id: string) {

  let query2 = `query MyQuery {
  node(
    id: "${id}"
  ) {
    ... on CartLine {
      id
      merchandise {
        ... on ProductVariant {
          id
          title
          product {
            title
          }
        }
      }
    }
  }
}`
  const unparsed = await client.request(query2)

  return (unparsed.data.node.merchandise.title)
}

async function getName(id: string) {

  let query2 = `query MyQuery {
  node(
    id: "${id}"
  ) {
    ... on CartLine {
      id
      merchandise {
        ... on ProductVariant {
          id
          title
          product {
            title
          }
        }
      }
    }
  }
}`
  const unparsed = await client.request(query2)

  return (unparsed.data.node.merchandise.product.title)
}

export default async function Post() {
  const cookieStore = await cookies()

  let cartCookie = cookieStore.get('cart')?.value



  {
    if ((cartCookie == null) || (cartCookie == '')) {
      const newEmptyCart = `
      mutation {
        cartCreate(input: {lines: []}) {
          cart {
            id
          }
        }
      }`
      let { data } = await client.request(newEmptyCart, {
        variables: {
          handle: 'sample-product',
        },
      });
      cartCookie = data.cartCreate.cart.id;

    }
  }

  const findCart = `
    query {
    cart(
      id: "${cartCookie}"
    ) {
      checkoutUrl
      totalQuantity
      lines(first: 10) {
        edges {
          node {
            id
            quantity
          }
        }
      }
    }
    }
    `;

  const { data } = await client.request(findCart, {
    variables: {
      handle: 'sample-product',
    },
  });


  let checkoutURL = data?.cart?.checkoutUrl
  if (data?.cart?.totalQuantity == 0) {
    checkoutURL = null
  }
  const array = data?.cart.lines.edges

  return (<div >

    <br />
    <div className="text-4xl font-bold font-bit" key={'test'}>
      Your Order: 

      <div className="border-dashed border-black border-2" key={'border'}>
        {array?.map((node: any) => (
          <div key={node.id} className="mb-6 -mt-6 font-title flex-col text-lg md:text-4xl">
            <br />
            <div key={node.node.id} className="flex-col ">&ensp;[{node.node.quantity}] {getName(node.node.id)}, {getSize(node.node.id)}</div>
          </div>
        ))}
      </div>
      <br />
      <div className="font-bit font-bold flex justify-between -mt-8">
        <div className="justify-start">
          <form action={"/shop/cart/add"}>
            <button className="" type="submit" name="action" value={"clear"}>
              <div className="hover:underline decoration-from-font decoration-tgs-purple">EMPTY</div>
            </button>
          </form>
        </div>
        <div>
          <a className="flex items-end hover:underline decoration-from-font decoration-tgs-purple" href={checkoutURL} target="_blank">
            CHECKOUT
          </a>
        </div>
      </div>
    </div>
  </div>)
}