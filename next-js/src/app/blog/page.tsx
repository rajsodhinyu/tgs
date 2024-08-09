import Image from "next/image"



export default function Page() {
    return ( 
    <div>
      <div>page start</div>
        <div className="">
            <div className="sticky size-48">
              <Image
              src='https://cdn.sanity.io/images/fnvy29id/tgs/57d74eea376fa502e0c1acf40c8bc570a0738035-1418x1418.jpg'
              fill={true}
              alt="Picture of the author"
              />
            </div>
        </div>
        <div>page end</div>
    </div>
  )
}