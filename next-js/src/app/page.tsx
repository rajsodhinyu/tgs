"use client"
import dynamic from 'next/dynamic';
import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';



const DynamicComponentWithNoSSR = dynamic(
  () => import("../app/ui/Backround"),
  { ssr: false ,  loading: () => <p>Loading...</p> ,}
)


export default function Page() {
  return (
    <div className='w-full'>
      

      <DynamicComponentWithNoSSR />
      TGS
    </div>
  )
}