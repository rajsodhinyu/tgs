import Nav from "../nav";
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Nav />
            <div className="mx-6 -mt-1 max-sm:mt-12" >
                <div className="text-4xl font-bit font-bold text-black text-left flex justify-between place-items-center"> {/* Title */}
                    <div className="hover:underline decoration-from-font decoration-tgs-purple"><a href="/shop">SHOP</a></div>
            
                    <div className="hover:underline decoration-from-font decoration-tgs-purple"><a href="/shop/cart">CART</a></div>
            
                </div>
                <div >{children}</div>
            </div>
        </div>
    );
}
