import Link from 'next/link'
 
export default function NotFound() {
  return (<div className='font-title text-6xl text-center m-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
    TGS is under construction!
    <br />
    <br />
    <div className="text-center text-balance hover:underline"><Link href="/">Return Home</Link></div>
    
  </div>)
}