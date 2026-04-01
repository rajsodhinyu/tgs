import Image from "next/image";
import Link from "next/link";
import Sotd from "./ui/Sotd";
import MobileMenu from "./ui/MobileMenu";

export default function Nav() {
  return (
    <main>
      {/* Mobile nav */}
      <div className="md:hidden flex items-center px-3 pt-3 h-20 gap-3">
        <MobileMenu />
        <div className="flex-1">
          <Sotd />
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex mx-3 pt-0 h-24 items-center justify-between">
        <div className="shrink h-12 flex gap-6 items-center lg:gap-8">
          <Link href="/" className="group relative">
            <Image
              className="relative z-40 max-h-16 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
              width={135}
              height={80}
              alt="TGS logo"
              priority
            />
            <Image
              className="hidden"
              style={{ height: "80px", width: "auto" }}
              src="https://cdn.sanity.io/images/fnvy29id/tgs/409cbc55ba676a991fd6d75f8ba242ad7dc08cd1-240x192.gif"
              width={165}
              height={150}
              alt="animatedTGS"
              quality={100}
            />
          </Link>

          <Link href="/about">
            <Image
              className="min-h-5 max-h-14 min-w-12 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png?h=200"
              width={95}
              height={40}
              alt="About"
            />
          </Link>

          <Link href="/blog">
            <Image
              className="min-h-5 max-h-14 min-w-10 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200"
              width={75}
              height={30}
              alt="Blog"
            />
          </Link>

          <Link href="/events">
            <Image
              className="min-h-5 max-h-14 min-w-10 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200"
              width={95}
              height={40}
              alt="Events"
            />
          </Link>

          <Link href="/shop" scroll={true}>
            <Image
              className="min-h-5 max-h-14 min-w-12 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200"
              width={95}
              height={40}
              alt="Shop"
            />
          </Link>

          <Link href="https://www.patreon.com/thatgoodshit">
            <Image
              className="min-h-6 max-h-14 min-w-16 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/aaadb16ce9553cad7741d97aa957f4f9d1a9e830-4809x1503.png?h=200"
              width={300}
              height={40}
              alt="Patreon"
            />
          </Link>
        </div>

        <Sotd />
      </div>
    </main>
  );
}
