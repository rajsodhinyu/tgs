"use client";

import { useEffect } from "react";
import Form from "next/form";

const cards = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/074edb4f6440d1ea2d0357c9d2df57a0cb6d0259-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/e6eae2708b82e5b582ba4ecdb73163b198f552f9-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/9cb2a0b8636707c1f6d68524402abc273d8cfe29-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/074edb4f6440d1ea2d0357c9d2df57a0cb6d0259-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/e6eae2708b82e5b582ba4ecdb73163b198f552f9-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/9cb2a0b8636707c1f6d68524402abc273d8cfe29-800x1000.png",
];

interface HorizontalCarouselProps {
  cards: string[]; // Array of image URLs
}

interface ShopInfoProps {
  cards2: string[]; //
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
      {/* Left Button */}
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

const ShopInfo: React.FC<ShopInfoProps> = () => {
  return (
    <div className="flex font-title">
      <Form className="" action="/shop/cart/add">
        <div className="flex">
          <div className="w-full flex-none mt-2 order-1 text-4xl sm:text-5xl font-bold text-tgs-purple">
            $89.00
          </div>
        </div>
        <div className="flex items-baseline mt-4 pb-6 place-content-center">
          <div className="space-x-2 flex text-sm font-bold">
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="49911676600642"
                defaultChecked
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                S
              </div>
            </label>
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="49911676666178"
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                L
              </div>
            </label>
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="49911676698946"
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                XL
              </div>
            </label>
            <label>
              <input
                className="sr-only peer"
                name="size"
                type="radio"
                value="49911676731714"
              />
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                2XL
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
  useEffect(() => {}, []);
  return (
    <div>
      <br />
      <div
        className="text-center font-title font-bold
          text-4xl md:text-5xl text-tgs-purple max-[340px]:w-80 w-full
        "
      >
        TGS Lounge Hoodie
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
        <div className="text-3xl font-bit font-bold text-pretty sm:w-5/6 text-center py-12">
          The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit
          featuring reverse appliqué artwork hand drawn by us.
        </div>
      </div>
    </div>
  );
}
