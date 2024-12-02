"use client"
import dynamic from 'next/dynamic';
import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';



const DynamicComponentWithNoSSR = dynamic(
  () => import("./ui/backround"),
  { ssr: false }
)


export default function Page() {
  return (
    <div>
      <p>View pictures</p>
 
      {/*  Works, since Carousel is a Client Component */}
      <DynamicComponentWithNoSSR />
    </div>
  )
}