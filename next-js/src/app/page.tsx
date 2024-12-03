"use client"
import dynamic from 'next/dynamic';
import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';
import Link from 'next/link';




const DynamicComponentWithNoSSR = dynamic(
  () => import("../app/ui/Backround"),
  { ssr: false, loading: () => <p className='font-title' >You are about to experience ThatGoodSh*t</p>, }
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
      <div className='absolute left-0 top-0'>{/* Logo */}
        <Link href={'/'}>
        <img className="h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200" alt="" />
        </Link>

      </div>
      <div className='absolute top-0 right-0'>{/* Blog */}
        <Link href={'/blog'}>
        <img className="h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200" alt="" />
        </Link>

      </div>
      <div className='absolute bottom-0 left-0'>{/* Events */}
        <Link href={'/events'}>
        <img className="h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/a82c27d8c7dcd43014eaa1fdc852185942645f7e-2037x795.png?h=200" alt="" />
        </Link>

      </div>
      <div className='absolute bottom-0 right-0'>{/* Shop */}
        <Link href={'/shop'}>
        <img className="h-16 md:m-10 m-2" src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200" alt="" />
        </Link>
      </div>
      <div onClick={catchClick}>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-96'>
        <button id="my-control"><img id ='disc' className = "" src="https://cdn.sanity.io/images/fnvy29id/tgs/a85e25b84a90b82c905130f525abd5c20aecf6ea-1700x1700.png?h=1000" alt="" />
          <audio loop id='myAudio' src="https://cdn.sanity.io/files/fnvy29id/tgs/16d2eea6de26ee3ab6aec3abc90492b2c3f7e854.mp3"></audio>
          </button>
          </div>
      </div>
      <div>
        
      </div>
    </div>

  )
}