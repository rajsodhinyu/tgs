import Image from "next/image";

export default function Page() {
  return (
    <div className="md:mt-10 mt-20 sm:px-40 mx-8">
      <div className="md:text-lg text-sm font-black font-bit text-pretty text-center sm:text-balance">
        <p>
          {" "}
          That Good Sh*t! because good music transcends genre. Our mission is to
          build community around shared love of music. With authenticity at the
          core of everything we do, TGS is your go-to source for keeping up with
          the most impactful and innovative music of today! Join our growing
          community by keeping up with our artist interviews, curated live
          events, playlists, blog, and more.
        </p>
      </div>
      <div className="my-10 place-items-center">
        <Image
          width={1250}
          height={1000}
          quality={100}
          className="w-full"
          src="https://cdn.sanity.io/images/fnvy29id/tgs/b5cee228b7299f1fd664e36a34f48678a30cb3d0-1250x1000.jpg"
          alt=""
        />
        <div className="pt-8 font-bit text-2xl decoration-tgs-purple text-center ">
          <a
            className="hover:underline hover:text-tgs-purple hover:font-bold"
            href="https://www.instagram.com/thatgoodsht"
          >
            Instagram
          </a>
          &emsp;
          <a
            className="hover:underline hover:text-tgs-purple hover:font-bold"
            href="https://www.youtube.com/@thatgoodshtmusic"
          >
            Youtube
          </a>
          &emsp;
          <a
            className="hover:underline hover:text-tgs-purple hover:font-bold"
            href="https://www.twitter.com/thatgoodsh_t"
          >
            Twitter
          </a>
          &emsp;
          <a
            className="hover:underline hover:text-tgs-purple hover:font-bold"
            href="https://discord.gg/PTYgag2kxD"
          >
            Discord
          </a>
          &emsp;
        </div>
      </div>
    </div>
  );
}
