"use client";

if (typeof window !== 'undefined') {
  
}
import { useEffect } from "react";




const cards = [
    "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f257ca192915a29bdd3dd0e9525a419bc1b348c4-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/6060cdd55e467e09f499ee923ad0d6196dc8af71-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/3907a5a1c363e8eab6b5cdbee014892da193a3fd-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f257ca192915a29bdd3dd0e9525a419bc1b348c4-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/6060cdd55e467e09f499ee923ad0d6196dc8af71-800x1000.png",
    "https://cdn.sanity.io/images/fnvy29id/tgs/3907a5a1c363e8eab6b5cdbee014892da193a3fd-800x1000.png"
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
            const scrollAmount = direction === "left" ?  -width: width;
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
          <div className="flex items-baseline mt-4 mb-6 pb-6 border-b border-tgs-purple place-content-center">
            <div className="space-x-2 flex text-sm font-bold">
              <label>
                <input className="sr-only peer" name="size" type="radio" value="49911677157698" defaultChecked />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                  S
                </div>
              </label>
              <label>
                <input className="sr-only peer" name="size" type="radio" value="49911677190466" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                  M
                </div>
              </label>
              <label>
                <input className="sr-only peer" name="size" type="radio" value="49911677223234" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                  L
                </div>
              </label>
              <label>
                <input className="sr-only peer" name="size" type="radio" value="49911677256002" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                  XL
                </div>
              </label>
              <label>
                <input className="sr-only peer" name="size" type="radio" value="49911677288770" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400 peer-checked:bg-tgs-purple peer-checked:text-white">
                  2XL
                </div>
              </label>
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
          text-4xl md:text-5xl text-tgs-purple w-80 min-[340px]:w-full
        ">
                Lounge Pant
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
        <div className="w-80 min-[340px]:w-full place-items-center">
          <div className="mt-5 text-center font-title font-bold
            text-4xl md:text-5xl text-tgs-purple">
                  Product Information
          </div>
          <div className="text-3xl font-bit font-bold text-pretty sm:w-5/6 text-center py-12">
          The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us.
            </div>
        </div>

    </div>)
}