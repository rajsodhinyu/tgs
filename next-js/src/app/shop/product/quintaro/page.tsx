"use client";

import { useState } from "react";
import Form from "next/form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quintaro - That Good Sh*t!",
  description:
    "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
  openGraph: {
    title: "Quintaro - That Good Sh*t!",
    description:
      "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
        width: 1000,
        height: 1250,
        alt: "Quintaro DVD by Quincy Davis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintaro - That Good Sh*t!",
    description:
      "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
    ],
  },
};

const cards = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
];

interface HorizontalCarouselProps {
  cards: string[];
}

interface ShopInfoProps {
  cards2: string[];
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ cards }) => {
  const scrollCarousel = (direction: "left" | "right") => {
    const container = document.querySelector(".carousel-container");
    var width = container?.clientWidth as number;
    if (container) {
      const scrollAmount = direction === "left" ? -width : width;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-row items-center justify-start w-full md:w-96 relative ">
      <button
        className="absolute -left-8 z-10 bg-tgs-pink bg-opacity-100  text-white p-1 pb-2 rounded-full -ml-2"
        onClick={() => scrollCarousel("left")}
      >
        <div className="font-title text-3xl pl-1"> &lt; </div>
      </button>

      {/* Carousel container */}
      <div className="carousel-container flex overflow-x-scroll snap-both snap-mandatory no-scrollbar rounded-lg">
        {cards.map((data, index) => (
          <section
            className="flex-shrink-0 snap-center flex justify-center items-center"
            key={index}
          >
            <img
              src={data}
              alt={`Image ${index + 1}`}
              className="h-[300px] md:h-[500px] rounded-md object-cover"
            />
          </section>
        ))}
      </div>

      {/* Right Button */}
      <button
        className="absolute -right-8 z-10 bg-tgs-pink bg-opacity-100 text-white p-1 pb-2 rounded-full flex -mr-2"
        onClick={() => scrollCarousel("right")}
      >
        <div className="font-title text-3xl pl-1">&gt;</div>
      </button>
    </div>
  );
};

const ShopInfo: React.FC<ShopInfoProps> = ({ cards2 }) => {
  const [isDVD, setIsDVD] = useState(true);
  const price = isDVD ? 20 : 15;

  return (
    <div className="flex font-title">
      <Form className="" action="/shop/cart/add">
        <div className="flex">
          <div className="w-full flex-none mt-2 order-1 text-4xl sm:text-5xl font-bold text-tgs-purple">
            ${price}
          </div>
        </div>
        <div className="flex items-baseline mt-4 pb-6 place-content-center">
          <div className="space-x-2 flex text-sm font-bold">
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="50552794710338"
                checked={isDVD}
                onChange={() => setIsDVD(true)}
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                DVD
              </div>
            </label>
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="50552803623234"
                checked={!isDVD}
                onChange={() => setIsDVD(false)}
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                CD
              </div>
            </label>
          </div>
        </div>
        <div className="flex space-x-4 mb-5 text-sm font-medium">
          <div className="flex-auto flex space-x-4 place-content-center">
            <button
              className="h-10 px-6 rounded-full bg-tgs-purple text-white"
              type="submit"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default function Post() {
  return (
    <div>
      <br />
      <div
        className="text-center font-title font-bold
          text-4xl md:text-5xl text-tgs-purple max-[340px]:w-80 w-full
        "
      >
        Quintaro
      </div>
      <div className="w-full flex justify-around flex-col flex-wrap sm:flex-nowrap sm:flex-row">
        <div className="flex mx-10 mt-10 w-60 md:w-fit place-self-center">
          {<HorizontalCarousel cards={cards}></HorizontalCarousel>}
          <div></div>
        </div>

        <div className="flex text-center place-self-center text-black text-balance text-sm md:text-lg pt-2">
          {<ShopInfo cards2={cards}></ShopInfo>}
        </div>
      </div>
      <br />
      <div
        className="w-80 min-[340px]:w-full
        place-items-center"
      >
        <div
          className="mt-5 text-center font-title font-bold
            text-4xl md:text-5xl text-tgs-purple"
        >
          Product Information
        </div>
        <div className="text-2xl font-bit font-bold text-pretty sm:w-5/6 text-left py-12">
          <p>Quincy Davis - Quintaro</p>
          <p>Format: DVD-R</p>
          <p>Runtime: 28m</p>
          <p>
            <br></br>
          </p>
          <p>
            Quintaro is about moving forward, climbing impossible heights, and
            perseverance through daydreams. The visualizer for this album is a
            biking edit, a surrealistic glitch collage, a multi-multi-media
            piece created by Quincy Davis and Raj Sodhi. The DVD was made for
            you to put into your Playstation when you’re on your couch or with
            the homies while you work or relax.
          </p>
          <p>
            <br></br>
          </p>
          <p>Album: Quincy Davis</p>
          <p>Edit/VFX: Raj Sodhi (@juulwry) + Quincy Davis (@quincydaviss)</p>
          <p>Footage: Raj Sodhi + Ria Mehrotra (@ria.mehrotra)</p>
          <p>Album and DVD Covers: Virgil Warren (@vw_studio5)</p>
        </div>
      </div>
    </div>
  );
}
