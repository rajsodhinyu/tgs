import Image from "next/image";
import Link from "next/link";
import Sotd from "./ui/Sotd";



export default function Nav() {
  return (
    <main>
      <div className="w-svh mx-3 mt-4 inset-0 h-24 flex items-baseline md:items-center flex-wrap md:justify-between md:flex-nowrap md:flex-row justify-around mb-3">
        {" "}
        {/*whole nav bar*/}
        <div className="shrink h-12 flex gap-3 sm:gap-6 items-center lg:gap-8 justify-start ">
          {/*everything not inc SOTD?*/}
          <Link href="/">
            <img
              className="min-h-5 max-h-16 min-w-12"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
            />
          </Link>
          <Link href="/about">
            <img
              className="min-h-5 max-h-16 min-w-12"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png?h=200"
            />
          </Link>
          <Link href="/blog">
            <img
              className="min-h-5 max-h-16 min-w-10"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200"
            />
          </Link>
          <Link href="/events">
            <img
              className="min-h-6 max-h-16 min-w-16"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200"
            />
          </Link>
          <Link href="/shop">
            <img
              className="min-h-5 max-h-16 min-w-12"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200"
            />
          </Link>
        </div>
        
        <Sotd></Sotd>
      </div>
    </main>
  );
}
