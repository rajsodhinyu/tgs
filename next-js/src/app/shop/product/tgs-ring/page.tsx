"use client";

import { useEffect } from "react";

const cards = [
    "https://cdn.sanity.io/images/fnvy29id/tgs/3fcdb1608e9d8a639cd6c42a1371ff72f3a0efd0-1786x2233.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f926d6430a94d4cc1d7b8a789fbe18766d84331e-2042x2552.jpg",
    
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
        var width = container?.clientWidth as number
        if (container) {
            const scrollAmount = direction === "left" ? -width : width;
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-row items-center justify-start w-full md:w-96 relative">
            {/* Left Button */}
            <button
                className="absolute -left-8 z-10 bg-tgs-pink bg-opacity-100  text-white p-1 pb-2 rounded-full"
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
                className="absolute -right-8 z-10 bg-tgs-pink bg-opacity-100 text-white p-1 pb-2 rounded-full flex"
                onClick={() => scrollCarousel("right")}
            >
                <div className="font-title text-3xl pl-1">&gt;</div>
            </button>
        </div>
    );
};

const ShopInfo: React.FC<ShopInfoProps> = ({cards2}) => {
    return(<div className="flex font-title">
        <form className="" action={"/shop/cart/add"}>
          <div className="flex">
            <div className="w-full flex-none mt-2 order-1 text-4xl font-bold text-tgs-purple">
              $79.00
            </div>
          </div>
          <div className="flex place-items-center items-baseline mt-4 mb-6 pb-6 border-b border-tgs-purple place-content-center">
            <div className="space-x-2 flex place-items-center text-sm font-bold">
              <div>
                SILVER
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529668930" defaultChecked />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    6
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529734466" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    7
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529800002" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    8
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529865538" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    9
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529931074" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    10
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207529996610" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    11
                  </div>
                </label>
              </div>
              <div>
                GOLD
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530291522"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    6
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530389826"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    7
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530455362"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    8
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530520898"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    9
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530586434"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    10
                  </div>
                </label>
                <label>
                  <input className="sr-only peer" name="size" type="radio" value="49207530651970"  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                    11
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 mb-5 text-sm font-medium">
            <div className="flex-auto flex space-x-4 place-content-center">
              <button className="h-10 px-6 rounded-full bg-tgs-purple text-white" type="submit" name="action" value={"now"}>
                Buy now
              </button>
              <button className="h-10 px-6 rounded-full border border-tgs-purple text-tgs-purple" type="submit" name="action" value={"cart"}>
                Add to cart
              </button>
            </div>
          </div>
        </form>
      </div>
      )
}

export default function Post() {
  useEffect(() => {

  }, []);
    return (<div >
        
        <br />
        <div className="text-center font-title font-bold
        text-2xl sm:text-3xl md:text-5xl text-tgs-purple
        ">
                THATGOODSH*T RING
        </div>
        <div className="w-full flex justify-around flex-col flex-wrap sm:flex-nowrap sm:flex-row">
              <div className="flex mx-10 mt-5 w-60 md:w-fit place-self-center">
                  {<HorizontalCarousel cards={cards}></HorizontalCarousel>}
                  <div>
                  </div>
              </div>

              <div className="flex text-center place-self-center text-black text-balance text-sm md:text-lg pt-2">
                  {<ShopInfo cards2={cards}></ShopInfo>}
              </div>
        </div>
        {/* <div className="mt-5 text-center font-title font-bold
          text-4xl md:text-5xl text-tgs-purple
        ">
                Product Information
        </div> */}

    </div>)
}