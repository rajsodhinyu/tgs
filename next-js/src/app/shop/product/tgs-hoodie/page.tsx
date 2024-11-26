"use client";

const cards = [
    "https://cdn.sanity.io/images/fnvy29id/tgs/7486e4a90f1e3108c32966ffa1cd24d07394f6c8-2100x2628.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f128efa4d7545273800504eca5734c3da4a3eb4f-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/3b27f29561b621f8ae783c84688f3f52ea463efd-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/ba150eb896964bcba1cc41b2578bf679462055dd-2048x2560.jpg",
];

interface HorizontalCarouselProps {
    cards: string[]; // Array of image URLs
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ cards }) => {
    const scrollCarousel = (direction: "left" | "right") => {
        const container = document.querySelector(".carousel-container");
        if (container) {
            const scrollAmount = direction === "left" ? -500 : 500;
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-row items-center justify-start w-full md:w-96 relative">
            {/* Left Button */}
            <button
                className="absolute left-0 z-10 bg-pink-400 bg-opacity-100  text-white p-1 pb-2 rounded-full"
                onClick={() => scrollCarousel("left")}
            >
                <div className="font-bit text-3xl "> &lt; </div>
            </button>

            {/* Carousel container */}
            <div className="carousel-container flex overflow-x-scroll snap-x snap-mandatory space-x-4 scrollbar-hidden rounded-lg">
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
                className="absolute right-0 z-10 bg-pink-400 bg-opacity-100 text-white p-1 pb-2 rounded-full flex"
                onClick={() => scrollCarousel("right")}
            >
                <div className="font-bit text-3xl ">&gt;</div>
            </button>
        </div>
    );
};


export default function Post() {
    return (<div className="m-10 sm:-mt-8">
        <div className="text-4xl font-bit font-bold text-black text-left flex justify-between"> {/* Title */}
            <div className=""><a href="/shop">SHOP</a></div>
            <div className="">CART</div>
        </div>
        <br />
        <div className="text-3xl text-center font-title font-bold">
            THATGOODSH*T HOODIE
        </div>
        <div className="flex-wrap sm:flex-nowrap sm:inline-flex">
            <div className="flex mx-10 mt-5">
                {<HorizontalCarousel cards={cards}></HorizontalCarousel>}
                <div>


                </div>
            </div>
            <div className="w-11/12 place-self-center text-center align-center text-black text-balance text-sm lg:text-lg font-semibold font-roc leading-none pt-2">hi</div>
            <div className="">

            </div>
        </div>

    </div>)
}