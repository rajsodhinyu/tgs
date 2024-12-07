import Link from "next/link";



export default function ShopCard({ title, description, cover, url }: { title: string, description: string ,cover: string, url:string }) {
  return (
    <div className=" align-middle pb-3">
     <Link className="" 
            href={url}
            scroll={true}
            > 
        <img className='rounded-md place-self-center flex shrink -mt-2' src={cover} alt="" width={500} height={500}/>
      <div className="flex-col justify-between">
        <div className="pt-4 text-center text-pretty text-black font-bold font-bit text-3xl leading-none">{title}</div>
        <div className="w-11/12 place-self-center text-center align-center text-black text-balance text-sm lg:text-lg font-semibold font-roc leading-none pt-2">{description}</div>
      </div>
      </Link>
    </div>
   
  )
}