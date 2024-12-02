"use client"
import dynamic from 'next/dynamic';
import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';
import Link from 'next/link';




const DynamicComponentWithNoSSR = dynamic(
  () => import("../app/ui/Backround"),
  { ssr: false ,  loading: () => <p>Loading...</p> ,}
)


export default function Page() {
  return (<div className='static'>
      <div className='w-full z-0 flex'>
        <DynamicComponentWithNoSSR />
        <div className=''>
          <div className='font-title m-10 absolute inset-0 text-white z-40 text-8xl'><Link href="/">
              <img
                className="h-16 md:h-28 min-w-10"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
              />
            </Link></div>
          <div className='font-title m-10 absolute bottom-0 left-0 text-white z-40 text-8xl'><Link href="/about">
              <img
                className="h-16 md:h-28 min-w-12"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/2db78d790b6062d7cb293b895f1d8cd3748353ef-1786x755.png?h=200"
              />
            </Link></div>
          <div className='font-title m-10 absolute top-0 right-0 text-white z-40 text-8xl'><Link href="/blog">
              <img
                className="h-16 md:h-28 min-w-10"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200"
              />
            </Link></div>
          <div className='font-title m-10 absolute right-0 text-white z-40 mt-96 pt-28 text-8xl'><Link href="/events">
              <img
                className="h-16 md:h-28 min-w-16"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200"
              />
            </Link></div>
          <div className='font-title m-10 absolute bottom-0 right-0 text-white z-40 text-8xl'><Link href="/shop">
              <img
                className="h-16 md:h-28 min-w-12"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200"
              />
            </Link></div>
        </div></div>
    
  </div>
  )
}