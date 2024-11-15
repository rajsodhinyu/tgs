import Link from "next/link";



export default function PlaylistCard({ title, description, cover, url }: { title: string, description: string ,cover: string, url:string }) {
  return (
    <div className=" align-middle pb-6 ">
     <Link className="hover:underline"
            href={url}> 
        <img className='rounded-xl place-self-center' src={cover} alt="" width={225} height={225}/>
      <div className="flex-col justify-start">
        <div className="pt-2 text-center text-black text-2xl font-medium font-bit leading-7">{title}</div>
        <div className="text-center text-black text-balance text-sm font-semibold font-roc leading-none pt-1">{description}</div>
      </div>
      </Link>
    </div>
   
  )
}