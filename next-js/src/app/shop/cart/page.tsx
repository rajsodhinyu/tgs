import { cookies } from "next/headers"
import { createStorefrontApiClient } from '@shopify/storefront-api-client';


const client = createStorefrontApiClient({
    storeDomain: 'http://d83529-c9.myshopify.com',
    apiVersion: '2024-04',
    publicAccessToken: '78a95c5656c69f0b57bec27d59a4e799',
});

const cookieStore = await cookies() 

const cartCookie = cookieStore.get('cart')?.value

console.log(cookieStore.toString())

const query = `
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

const { data } = await client.request(query, {
    variables: {
        handle: 'sample-product',
    },
});


const checkoutURL = data.cart.checkoutUrl
const array = data.cart.lines.edges
//console.log(array)

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

    return (<div >

        <br />
        <div className="text-4xl font-roc">
            Your Cart:
            {array.map((node:any) => (
        <div key={node.id}>
          {getName(node.node.id)}, {getSize(node.node.id)}: {node.node.quantity}
        </div>
      ))}
            <br />
            <div> <a href={checkoutURL}>checkout</a> </div>

        </div>
    </div>)
}