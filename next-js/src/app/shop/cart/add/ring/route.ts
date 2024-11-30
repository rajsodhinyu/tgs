import { redirect } from "next/navigation";

export async function GET(request: Request) {
  console.log('ring added to cart');  
  redirect('/shop/cart')
  }