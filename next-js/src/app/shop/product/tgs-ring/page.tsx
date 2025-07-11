"use client";

import { useEffect } from "react";
import Form from "next/form";
const cards = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6f00d0ca0c8bdb783cc4d4ad0e3e5ea1b20d3921-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6f00d0ca0c8bdb783cc4d4ad0e3e5ea1b20d3921-800x1000.png",
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

const ShopInfo: React.FC<ShopInfoProps> = ({ cards2 }) => {
  return (
    <div className="flex font-title">
      <Form className="" action="/shop/cart/add">
        <div className="flex">
          <div className="w-full flex-none mt-2 order-1 text-4xl sm:text-5xl font-bold text-tgs-purple">
            $55.00
          </div>
        </div>
        <div className="flex items-baseline mt-4 pb-6 place-content-center">
          <div className="space-x-2 flex text-sm font-bold">
            <div className="">
              <div className="mb-3 text-tgs-purple">SILVER</div>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529668930"
                  defaultChecked
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  6
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529734466"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  7
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529800002"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  8
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529865538"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  9
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529931074"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  10
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207529996610"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  11
                </div>
              </label>
            </div>
            <div>
              <div className="mb-3 text-tgs-purple">GOLD</div>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530291522"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  6
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530389826"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  7
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530455362"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  8
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530520898"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  9
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530586434"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  10
                </div>
              </label>
              <label>
                <input
                  className="sr-only peer"
                  name="size"
                  type="radio"
                  value="49207530651970"
                />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white">
                  11
                </div>
              </label>
            </div>
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
        THATGOODSH*T RING
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
          Rep That Good Sh*t on your finger, in your choice of 14K Gold or 925K
          Sterling Silver.
        </div>
      </div>
    </div>
  );
}
