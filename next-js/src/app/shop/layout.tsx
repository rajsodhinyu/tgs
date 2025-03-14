import Link from "next/link";
import Nav from "../nav";
export default function Layout({ children }: { children: React.ReactNode }) {
    
    return (
        <div>
            <Nav />
            <div className="mx-6 -mt-1 max-sm:mt-16" >
                <div className="text-4xl font-bit font-bold text-black text-left flex justify-between place-items-center"> 
                    <div className="hover:underline decoration-from-font decoration-tgs-purple"><Link href="/shop">SHOP</Link></div>
            
                    <div className="hover:underline decoration-from-font decoration-tgs-purple">
                        <Link href="/shop/cart">CART</Link></div>

                </div>
                <div >{children}</div>
            </div>
        </div>
    );
}
