import Image from "next/image";
import Link from "next/link";

export interface event {
    flyer: string;
    slug?: any ;
}


export default function Card(josh: event) {
    return (
        <Link href={josh.slug}>
        <div className="text-white flex place-content-center hover:scale-95">
            <div className="relative size-56 ">
                <Image className=" object-contain"
                    src={josh.flyer}
                    fill = {true}
                    alt="Author Picture"
                />
            </div>
        </div>
        </Link>
        )
}