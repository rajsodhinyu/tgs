import Image from "next/image";

export interface blog {
    flyer: string;
    slug: string;
}


export default function Card({ url }: {url:string}) {
    return (
        <div className="rounded-lg text-white flex place-content-center">
            <div className="relative size-56">
                <Image className="object-contain"
                    src={url}
                    fill = {true}
                    alt="Author Picture"
                />
            </div>
        </div>
        )
}