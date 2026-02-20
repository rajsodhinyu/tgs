import Image from "next/image";
import { Metadata } from "next";
import ChevronDots from "../components/ChevronDots";

export const metadata: Metadata = {
  title: "About - That Good Sh*t!",
  description:
    "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
  openGraph: {
    title: "About - That Good Sh*t!",
    description:
      "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/b5cee228b7299f1fd664e36a34f48678a30cb3d0-1250x1000.jpg",
        width: 1250,
        height: 1000,
        alt: "That Good Sh*t! Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About - That Good Sh*t!",
    description:
      "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/b5cee228b7299f1fd664e36a34f48678a30cb3d0-1250x1000.jpg",
    ],
  },
};

export default function Page() {
  return (
    <div className="md:mt-10 sm:px-40 mx-8">
      <div className="md:text-lg text-sm font-black font-title text-white text-pretty text-center sm:text-balance">
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
        <div className="pt-8 font-title text-2xl text-white text-center flex justify-center gap-6 flex-wrap">
          <a
            className="hover:underline decoration-white inline-flex items-center gap-1"
            href="https://www.instagram.com/thatgoodsht"
          >
            Instagram <ChevronDots className="mt-0.5" />
          </a>
          <a
            className="hover:underline decoration-white inline-flex items-center gap-1"
            href="https://www.youtube.com/@thatgoodshtmusic"
          >
            Youtube <ChevronDots className="mt-0.5" />
          </a>
          <a
            className="hover:underline decoration-white inline-flex items-center gap-1"
            href="https://www.twitter.com/thatgoodsh_t"
          >
            Twitter <ChevronDots className="mt-0.5" />
          </a>
          <a
            className="hover:underline decoration-white inline-flex items-center gap-1"
            href="https://discord.gg/PTYgag2kxD"
          >
            Discord <ChevronDots className="mt-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
