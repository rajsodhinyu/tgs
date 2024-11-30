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
    const cartCookie = cookieStore.get('cart')?.value
    console.log(`current cart is ${cartCookie}`)
    console.log("exiting cookieStore.get('cart')?.value")
    
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
    
    
    const checkoutURL = data?.cart.checkoutUrl
    const array = data?.cart.lines.edges
    return (<div >

        <br />
        <div className="text-4xl font-roc" key={'hey'}>
            Your Cart: ({cartCookie})
            {console.log(data.cart)}
            {array?.map((node:any) => (
        <div key={node.id}>
          <br />
          {getName(node.node.id)}, {getSize(node.node.id)}: {node.node.quantity}
        </div>
      ))}
            <br />
            <div className="text-right font-bit font-bold"> <form action={"/shop"}> <button type="submit" name="action" value={"clear"}>CLEAR</button></form><a href={checkoutURL}>CHECKOUT</a> </div>

        </div>
    </div>)
}