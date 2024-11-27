import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <main>
      <div className="w-svh sm:m-10 mx-3 md:mt-4 inset-0 h-24 flex items-baseline md:items-center flex-wrap md:justify-between  md:flex-nowrap md:flex-row justify-around mb-10">
        {" "}
        {/*whole nav bar*/}
        <div className="shrink h-12 flex gap-6 items-center lg:gap-8 justify-start">
          {/*everything not inc SOTD?*/}
          <Link href="/">
            <img
              className="min-h-6 max-h-16 min-w-10"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png"
            />
          </Link>
          <Link href="/about">
            <img
              className="min-h-5 max-h-16 min-w-12"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png"
            />
          </Link>
          <Link href="/blog">
            <img
              className="min-h-5 max-h-16 min-w-10"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png"
            />
          </Link>
          <Link href="/events">
            <img
              className="min-h-6 max-h-16 min-w-16"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png"
            />
          </Link>
          <Link href="/shop">
            <img
              className="min-h-5 max-h-16 min-w-12"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png"
            />
          </Link>
        </div>
        <div className="pt-3 md:pt-0">
          <div className="w-72 xl:w-72 md:ml-4 xl:flex-none h-16 bg-gradient-to-r from-tgs-pink via-[#a651ff] to-tgs-purple rounded-xl inline-flex place-items-center align-center justify-around">
            <div>
              <img src="https://cdn.sanity.io/images/fnvy29id/tgs/28685632d9f7cafdcf0eac8957e9146268afd0f9-163x116.png" alt="" width={40} />
            </div>
            <div className="text-white font-extrabold text-xl leading-3 tracking-wide font-title text-right md:text-xl">
              SONG OF THE DAY
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
