import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <main >
      <div className="static"> {/*nav bar?*/}
      
        <div className="flex items-center pt-6 ">
          
        <div className="flex-auto"> 
            <Link href='/'>
            <Image src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png" alt="TGS Logo" width={120} height={70} priority />
            </Link>
            </div>
           <div className="flex-auto">
            <Link href='/about'>
            <Image src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png" alt="About"
              width={130}
              height={50} />
            </Link>
          </div> 
          
            <div className="flex-auto">
            <Link href="/blog">
              <Image src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png" alt="Blog"
                width={100}
                height={50} />
            </Link>
            </div> 
          <div className="flex-auto">
          <Link href="/events">
            <Image src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png" alt="Events"
              width={130}
              height={50} />
          </Link>
          </div>
          <div className="flex">
            <Image src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png" alt="Shop"
              width={110}
              height={50} />
          </div>
        </div>
      </div>
    </main>
  )
  }