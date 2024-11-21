import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <main >
        <div className="w-svh inset-0 h-24 p-3 flex items-baseline justify-around flex-wrap py-7 mb-14
        md:justify-between md:flex-nowrap md:flex-row"> {/*whole nav bar*/}
          <div className="shrink h-12 flex md:px-6 px-3 gap-4 lg:gap-8 items-center md:justify-start"> {/*everything not inc SOTD?*/}
            <Link href='/'>
              <img className="min-h-6 max-h-16 min-w-10" src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png" />
            </Link>
            <Link href='/about'>
              <img className="min-h-5 max-h-16 min-w-12" src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png" />
            </Link>
            <Link href="/blog">
              <img className="min-h-5 max-h-16 min-w-10" src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png" />
            </Link>
            <Link href="/events">
              <img className="min-h-6 max-h-16 min-w-16" src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png" />
            </Link>
            <Link href="/">
              <img className="min-h-5 max-h-16 min-w-12" src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png" />
            </Link>
            </div>
            <div>
              <div className="w-72 md:w-64 lg:w-80 xl:flex-none h-14 bg-gradient-to-r from-[#aa3e98] to-[#9368b7] rounded-2xl shadow inline-flex place-items-center align-super justify-around m-4 md:m-0">
                <div>
                  <svg height="45" viewBox="0 0 54 45" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="backwards" filter="url(#filter0_d_122_62)"> 
                    <path id="Vector" d="M6.75916 20.1683L23.728 10.2367C24.1477 9.98678 24.6284 9.85177 25.1198 9.84574C25.6111 9.83971 26.0951 9.96288 26.5212 10.2024C26.9835 10.4657 27.3663 10.8441 27.6308 11.299C27.8952 11.7539 28.0319 12.2692 28.027 12.7925V19.7403L44.2635 10.234C44.6833 9.98414 45.164 9.84914 45.6554 9.84311C46.1467 9.83708 46.6307 9.96024 47.0568 10.1997C47.5191 10.4631 47.9019 10.8414 48.1664 11.2964C48.4308 11.7513 48.5675 12.2666 48.5626 12.7899V32.2137C48.5678 32.7372 48.4312 33.2527 48.1667 33.7078C47.9022 34.1629 47.5193 34.5414 47.0568 34.8047C46.6307 35.0442 46.1467 35.1674 45.6554 35.1614C45.164 35.1553 44.6833 35.0203 44.2635 34.7704L28.027 25.2598V32.2102C28.0328 32.7343 27.8966 33.2505 27.632 33.7063C27.3675 34.162 26.9842 34.5411 26.5212 34.8047C26.0951 35.0442 25.6111 35.1674 25.1198 35.1614C24.6284 35.1553 24.1477 35.0203 23.728 34.7704L6.75916 24.8388C6.35577 24.5916 6.02319 24.2482 5.79265 23.8408C5.56211 23.4334 5.44116 22.9754 5.44116 22.5097C5.44116 22.044 5.56211 21.586 5.79265 21.1786C6.02319 20.7712 6.35577 20.4278 6.75916 20.1806V20.1683Z" fill="#6F5BC4" stroke="white" /> </g> <defs><filter id="filter0_d_122_62" x="0" y="0" width="54" height="53" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dy="4" /><feGaussianBlur stdDeviation="2" /> <feComposite in2="hardAlpha" operator="out" /> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" /> <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_62" /> <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_62" result="shape" /> </filter> </defs>
                  </svg>
                </div>
                <div className="text-white font-extrabold text-xl leading-3 tracking-wide font-title text-right md:text-lg">SONG OF THE DAY</div>
              </div>
            </div>

        </div>
    </main>
  )
}