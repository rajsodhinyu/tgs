import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { shopifyClient as client } from '@/lib/shopify';

const newEmptyCart = `
  mutation {
    cartCreate(input: {lines: []}) {
      cart {
        id
      }
    }
  }
`;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const url = new URL(request.url);
    const action = url.searchParams.get("size");
    
    if (!action) {
      throw new Error("No action specified");
    }

    if (action === "clear") {
      // Clear the cart
      cookieStore.delete("cart");
      const { data } = await client.request(newEmptyCart);
      if (!data?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cookieStore.set("cart", data.cartCreate.cart.id);
      redirect("/shop/cart/");
    }

    const product = `gid://shopify/ProductVariant/${action}`;
    const currentCart = cookieStore.get("cart");
    
    if (currentCart?.value) {
      // Try to add item to existing cart
      const addItemtoCart = `
        mutation {
          cartLinesAdd(
            cartId: "${currentCart.value}"
            lines: {merchandiseId: "${product}"}
          ) {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `;
      
      try {
        await client.request(addItemtoCart);
      } catch (error) {
        // If adding to cart fails, create a new cart
        console.error("Failed to add to existing cart:", error);
        const { data } = await client.request(newEmptyCart);
        if (!data?.cartCreate?.cart?.id) {
          throw new Error("Failed to create new cart");
        }
        cookieStore.set("cart", data.cartCreate.cart.id);
        // Try adding the item to the new cart
        const newCartAdd = `
          mutation {
            cartLinesAdd(
              cartId: "${data.cartCreate.cart.id}"
              lines: {merchandiseId: "${product}"}
            ) {
              cart {
                id
                checkoutUrl
              }
            }
          }
        `;
        await client.request(newCartAdd);
      }
    } else {
      // Create new cart with item
      const newCartwithItem = `
        mutation {
          cartCreate(
            input: {lines: [{quantity: 1, merchandiseId: "${product}"}]}
          ) {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `;
      
      const { data } = await client.request(newCartwithItem);
      if (!data?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cookieStore.set("cart", data.cartCreate.cart.id);
    }
    
    redirect("/shop/cart/");
  } catch (error) {
    console.error("Cart operation error:", error);
    // Redirect to cart page even on error - the cart page will handle the error state
    redirect("/shop/cart/");
  }
}
