import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { shopifyClient as client } from '@/lib/shopify';

const NEW_EMPTY_CART = `
  mutation CreateEmptyCart {
    cartCreate(input: {lines: []}) {
      cart {
        id
      }
    }
  }
`;

const ADD_TO_CART = `
  mutation AddToCart($cartId: ID!, $merchandiseId: ID!) {
    cartLinesAdd(
      cartId: $cartId
      lines: { merchandiseId: $merchandiseId }
    ) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

const CREATE_CART_WITH_ITEM = `
  mutation CreateCartWithItem($merchandiseId: ID!) {
    cartCreate(
      input: { lines: [{ quantity: 1, merchandiseId: $merchandiseId }] }
    ) {
      cart {
        id
        checkoutUrl
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
      const { data } = await client.request(NEW_EMPTY_CART);
      if (!data?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cookieStore.set("cart", data.cartCreate.cart.id);
      redirect("/shop/cart/");
    }

    if (!/^\d+$/.test(action)) {
      throw new Error("Invalid variant ID");
    }

    const merchandiseId = `gid://shopify/ProductVariant/${action}`;
    const currentCart = cookieStore.get("cart");

    if (currentCart?.value) {
      // Try to add item to existing cart
      try {
        await client.request(ADD_TO_CART, {
          variables: {
            cartId: currentCart.value,
            merchandiseId,
          },
        });
      } catch (error) {
        // If adding to cart fails, create a new cart
        console.error("Failed to add to existing cart:", error);
        const { data } = await client.request(NEW_EMPTY_CART);
        if (!data?.cartCreate?.cart?.id) {
          throw new Error("Failed to create new cart");
        }
        cookieStore.set("cart", data.cartCreate.cart.id);
        // Try adding the item to the new cart
        await client.request(ADD_TO_CART, {
          variables: {
            cartId: data.cartCreate.cart.id,
            merchandiseId,
          },
        });
      }
    } else {
      // Create new cart with item
      const { data } = await client.request(CREATE_CART_WITH_ITEM, {
        variables: { merchandiseId },
      });
      if (!data?.cartCreate?.cart?.id) {
        throw new Error("Failed to create new cart");
      }
      cookieStore.set("cart", data.cartCreate.cart.id);
    }

    redirect("/shop/cart/");
  } catch (error) {
    // Re-throw redirect errors — Next.js uses thrown errors for redirects
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Cart operation error:", error);
    redirect("/shop/cart/");
  }
}
