import Link from "next/link"

export default function Post() {
  return (<div className='font-title text-4xl text-center *:text-balance absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
    <div className="text-2xl">
      No upcoming events for now!
      <br />
      <Link className="hover:underline" href="sms:+18055002436">Text +1-(805)-500-2436 to be the first to know...</Link>
    </div>
    <br />
    <div className="text-center  hover:underline"><Link href="/events/archive">Check out the Events Archive &gt;</Link></div>
    
  </div>)
}
