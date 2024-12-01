import { cookies } from "next/headers"
import { createStorefrontApiClient } from '@shopify/storefront-api-client';


const client = createStorefrontApiClient({
    storeDomain: 'http://d83529-c9.myshopify.com',
    apiVersion: '2024-04',
    publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});



async function getSize (id:string) {
    console.log(id)
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

async function getName (id:string) {
    console.log(id)
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
    console.log(unparsed.data.node.merchandise.title)
    return (unparsed.data.node.merchandise.product.title)
}

export default async function Post() {
    const cookieStore = await cookies() 
    console.log("ENTERING cookieStore.get('cart')?.value")
    let cartCookie = cookieStore.get('cart')?.value
    console.log(`current cart is ${cartCookie}`)
    console.log("exiting cookieStore.get('cart')?.value")
    
    {if ((cartCookie == null)||(cartCookie == '')) {
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
    }}

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
    <div className="text-4xl font-roc" key={"hey"}>
      Your Cart: ({cartCookie})

      <div className="border-dashed border-black border-2">
        {array?.map((node: any) => (
          <div key={node.id} className="my-6 font-title flex-col ">
            <br />
            <div className="flex-col ">&ensp;[{node.node.quantity}] {getName(node.node.id)}, {getSize(node.node.id)}</div>
          </div>
        ))}
      </div>
      <br />
      <div className="font-bit font-bold flex justify-between">
        <div className="justify-start">
          <form action={"/shop"}>
            <button className="" type="submit" name="action" value={"clear"}>
              CLEAR
            </button>
          </form>
        </div>
        <div>
          <a className="flex items-end" href={checkoutURL}>
            CHECKOUT
          </a>
        </div>
      </div>

        </div>
    </div>)
}