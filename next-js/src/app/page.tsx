

import * as React from 'react'
import p5, { ANGLE_MODE } from 'p5';
import { MyComp } from './backround';




export default function Page() {
  return (
    <div>
      <p>View pictures</p>
 
      {/*  Works, since Carousel is a Client Component */}
      <MyComp />
    </div>
  )
}