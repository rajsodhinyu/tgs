import Link from "next/link";



export default function PlaylistCard({ title, description, cover, url }: { title: string, description: string ,cover: string, url:string }) {
  return (
    <div className=" align-middle pb-3 ">
     <Link className="hover:underline decoration-indigo-700"
            href={url}> 
        <img className='rounded-xl place-self-center' src={cover} alt="" width={225} height={225}/>
      <div className="flex-col justify-start">
        <div className="pt-4 text-center text-pretty text-black text-3xl font-medium font-bit leading-7">{title}</div>
        <div className="text-center text-black text-pretty text-sm font-semibold font-roc leading-none pt-2">{description}</div>
      </div>
      </Link>
    </div>
   
  )
}