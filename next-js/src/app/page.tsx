"use client"
import dynamic from 'next/dynamic'
import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';
import Link from 'next/link';




const DynamicComponentWithNoSSR = dynamic(
  () => import("../app/ui/Backround"),
  { ssr: false, loading: () => <p className='font-title text-xl absolute top-1/4 left-1/2 transform -translate-x-1/2 +translate-y-3/4' >Loading That Good Sh*t...</p>, }
)

const Clear = dynamic(
  () => import("../app/ui/Clear"),
  { ssr: false, loading: () => <p>clearing...</p>, }
)


function catchClick(){
  let audio = (document.getElementById('myAudio')) as HTMLAudioElement
  if (audio.paused){
    document.getElementById('disc')!.className = 'cd-disc-going animate-spin';
    audio.play()
  }
  else {
    document.getElementById('disc')!.className = 'cd-disc';
    audio.pause()
  }
}
  


export default function Page() {
  return (
    <div>
      <div> {/* Graphic */}
        <DynamicComponentWithNoSSR />
      </div>
      <Link className='' href={'/'}scroll={false} >
      <div className='absolute left-0 top-0'>{/* Logo */}
        
        <img className="h-10 md:h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200" alt="" />
        </div>
        </Link>

        <Link className='' href={'/blog'}scroll={false} >
      <div className='absolute top-0 right-0'>{/* Blog */}
        
        <img className="h-10 md:h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200" alt="" />
        </div>
        </Link>

      
        <Link className='' href={'/events'}scroll={false} >
      <div className='absolute bottom-0 left-0'>{/* Events */}
        
        <img className="h-10 md:h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200" alt="" />
        </div>
        </Link>

        <Link className='' href={'/shop'}scroll={false} >
      <div className='absolute bottom-0 right-0'>{/* Shop */}
       
        <img className="h-10 md:h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200" alt="" />
        
      </div>
      </Link>
      <div onClick={catchClick}>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  size-60 md:size-96'>
        <img id ='disc' className = "" src="https://cdn.sanity.io/images/fnvy29id/tgs/15c6bd4e378be982f1db27707caf618c07fd5a39-2048x2048.png?h=1000" alt="" />
          </div>
      </div>
      <div>
        
      </div>
    </div>

  )
}