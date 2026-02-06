import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { shopifyClient as client } from '@/lib/shopify';
import Form from "next/form";

const CART_LINE_DETAILS = `
  query CartLineDetails($id: ID!) {
    node(id: $id) {
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
  }
`;

async function getSize(id: string) {
  const unparsed = await client.request(CART_LINE_DETAILS, {
    variables: { id },
  });
  const title = unparsed.data.node.merchandise.title;
  return title == "Default Title" ? "" : `, ${title}`;
}

async function getName(id: string) {
  const unparsed = await client.request(CART_LINE_DETAILS, {
    variables: { id },
  });
  return unparsed.data.node.merchandise.product.title;
}

export default async function Post() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value;

  // Server Components can't set cookies — redirect to the /shop route
  // handler which creates a cart and sets the cookie properly
  if (!cartCookie) {
    redirect("/shop?returnTo=/shop/cart");
  }

  const FIND_CART = `
    query FindCart($cartId: ID!) {
      cart(id: $cartId) {
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

  const cartData = await client.request(FIND_CART, {
    variables: { cartId: cartCookie },
  });

  // Cart expired or invalid in Shopify — redirect to /shop to
  // create a fresh cart and set a valid cookie
  if (!cartData?.data?.cart) {
    redirect("/shop?returnTo=/shop/cart");
  }

  try {
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
