import Link from "next/link";
import Nav from "../nav";
import ChevronDots from "../components/ChevronDots";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full pb-10 min-h-screen bg-gradient-radial from-tgs-dark-purple to-tgs-pink">
      <Nav />
      <div className="mx-6 -mt-1 max-sm:mt-3">
        <div className="text-4xl font-title font-bold text-white text-left flex justify-between place-items-center uppercase">
          <div className="border-b-2 border-transparent hover:border-white">
            <Link href="/shop" className="flex items-center gap-2">SHOP</Link>
          </div>

          <div className="border-b-2 border-transparent hover:border-white">
            <Link href="/shop/cart" className="flex items-center gap-2">
              CART <ChevronDots className="mt-1" />
            </Link>
          </div>
        </div>
        <div>{children}</div>
        <div className="font-title font-bold text-white text-pretty text-center sm:py-5 text-xl uppercase">
          <a
            href="mailto:raj@thatgoodsht.com?subject=TGS%20Shop%20Issue"
            className="border-b-2 border-transparent hover:border-white"
          >
            Having issues with your order?
          </a>
        </div>
      </div>
    </div>
  );
}
