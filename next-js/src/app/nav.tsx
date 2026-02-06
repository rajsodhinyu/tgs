import Image from "next/image";
import Link from "next/link";
import Sotd from "./ui/Sotd";

export default function Nav() {
  return (
    <main>
      <div className="w-svh mx-3 pt-4 inset-0 h-24 flex items-baseline md:items-center flex-wrap md:justify-between md:flex-nowrap md:flex-row justify-around mb-3">
        {/*whole nav bar*/}
        <div className="shrink h-12 flex gap-3 sm:gap-6 items-center lg:gap-8 justify-start ">
          {/*everything not inc SOTD?*/}
          <Link href="/" className="group">
            <Image
              className="z-40 max-h-16 w-auto lg:invisible"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
              width={135}
              height={80}
              alt="TGS logo"
              priority
            />
            <Image
              className="z-40 max-h-16 w-auto absolute left-3 top-6 max-lg:invisible"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
              width={135}
              height={80}
              alt="TGS logo"
              priority
            />
            <Image
              className="z-0 sm:hidden group-hover:block absolute -left-2 -top-2 max-lg:invisible"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/409cbc55ba676a991fd6d75f8ba242ad7dc08cd1-240x192.gif"
              width={165}
              height={150}
              alt="animatedTGS"
              quality={100}
            />
          </Link>

          <Link href="/about">
            <Image
              className="min-h-5 max-h-16 min-w-12 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png?h=200"
              width={95}
              height={40}
              alt="About"
            />
          </Link>
          <Link href="https://www.patreon.com/thatgoodshit">
            <Image
              className="min-h-6 max-h-16 min-w-16 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/aaadb16ce9553cad7741d97aa957f4f9d1a9e830-4809x1503.png?h=200"
              width={300}
              height={40}
              alt="Patreon"
            />
          </Link>
          <Link href="/blog">
            <Image
              className="min-h-5 max-h-16 min-w-10 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200"
              width={75}
              height={40}
              alt="Blog"
            />
          </Link>

          <Link href="/shop" scroll={true}>
            <Image
              className="min-h-5 max-h-16 min-w-12 w-auto"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200"
              width={95}
              height={40}
              alt="Shop"
            />
          </Link>
        </div>

        <Sotd></Sotd>
      </div>
    </main>
  );
}
