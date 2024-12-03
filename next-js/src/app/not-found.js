import Link from 'next/link'
 
export default function NotFound() {
  return (<div className='font-title text-4xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
    -404-
    <br />
    Looking for That Good Sh*t?
    <br /><br />
    <div className="text-center text-balance hover:underline"><Link href="/">Home</Link></div>
    
  </div>)
}