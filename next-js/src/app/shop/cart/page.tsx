import { cookies } from "next/headers";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import Form from "next/form";

const client = createStorefrontApiClient({
  storeDomain: "http://d83529-c9.myshopify.com",
  apiVersion: "2024-04",
  publicAccessToken: "78a95c5656c69f0b57bec27d59a4e799",
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
}`;
  const unparsed = await client.request(query2);
  const title = unparsed.data.node.merchandise.title;
  return title == "Default Title" ? "" : `, ${title}`;
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
}`;
  const unparsed = await client.request(query2);

  return unparsed.data.node.merchandise.product.title;
}

const newEmptyCart = `
  mutation {
    cartCreate(input: {lines: []}) {
      cart {
        id
      }
    }
  }`;

export default async function Post() {
  try {
    const cookieStore = await cookies();
    let cartCookie = cookieStore.get("cart")?.value;
    
    // If no cart cookie exists or it's empty, create a new cart
    if (!cartCookie) {
      const { data } = await client.request(newEmptyCart);
      if (!data?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cartCookie = data.cartCreate.cart.id;
    }

    const findCart = `
      query {
        cart(id: "${cartCookie}") {
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

    let cartData = await client.request(findCart);
    
    // If cart doesn't exist in Shopify, create a new one
    if (!cartData?.data?.cart) {
      const { data: newCartData } = await client.request(newEmptyCart);
      if (!newCartData?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cartCookie = newCartData.cartCreate.cart.id;
      // Re-fetch the cart data
      const refreshedData = await client.request(findCart);
      if (!refreshedData?.data?.cart) {
        throw new Error("Failed to fetch cart data");
      }
      cartData = refreshedData;
    }

    let checkoutURL = cartData.data.cart?.checkoutUrl;
    if (cartData.data.cart?.totalQuantity === 0) {
      checkoutURL = null;
    }
    
    const array = cartData.data.cart?.lines?.edges || [];
    
    return (
      <div className="">
        <br />
        <div className="text-4xl font-bold font-bit" key={"test"}>
          Your Cart:
          <div className="border-dashed border-black border-2" key={"border"}>
            {array.map((node: any) => (
              <div
                key={`item ${node.node.id}`}
                className="mb-6 -mt-6 font-title flex-col text-lg md:text-4xl"
              >
                <br />
                <div key={node.id} className="flex-col ">
                  &ensp;[{node.node.quantity}] {getName(node.node.id)}
                  {getSize(node.node.id)}
                </div>
              </div>
            ))}
          </div>
          <br />
          <div className="font-bit font-bold flex justify-between -mt-8 sm:text-4xl text-xl">
            <div className="justify-start ">
              <Form action="/shop/cart/add">
                <input type="hidden" id="clear" name="size" value="clear" />
                <button
                  className="hover:underline decoration-from-font decoration-tgs-purple"
                  type="submit"
                >
                  EMPTY
                </button>
              </Form>
            </div>
            <div>
              {checkoutURL && (
                <a
                  className="flex items-end hover:underline decoration-from-font decoration-tgs-purple"
                  href={checkoutURL}
                  target="_blank"
                >
                  CHECKOUT
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Cart error:", error);
    return (
      <div className="text-4xl font-bold font-bit">
        <p>There was an error loading your cart. Please try again.</p>
      </div>
    );
  }
}
