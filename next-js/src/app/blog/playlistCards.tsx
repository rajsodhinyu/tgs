import Link from "next/link";



export default function PlaylistCard({ title, description, cover, url }: { title: string, description: string ,cover: string, url:string }) {
  return (
    <div className=" align-middle pb-3 ">
     <Link className="hover:underline decoration-tgs-purple"
            href={url}> 
        <img className='rounded-lg place-self-center flex shrink' src={`${cover}?h=600`} alt="" width={500} height={500}/>
      <div className="flex-col justify-between">
        <div className="pt-4 text-center text-pretty text-black text-xl font-bold font-bit leading-4 lg:text-3xl">{title}</div>
        <div className="w-11/12 place-self-center text-center align-center text-black text-balance text-xs lg:text-lg font-semibold font-roc leading-none pt-2">{description}</div>
      </div>
      </Link>
    </div>
   
  )
}