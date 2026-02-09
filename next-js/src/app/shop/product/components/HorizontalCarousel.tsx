"use client";

import ChevronDots from "../../../components/ChevronDots";

export default function HorizontalCarousel({ cards }: { cards: string[] }) {
  const scrollCarousel = (direction: "left" | "right") => {
    const container = document.querySelector(".carousel-container");
    const width = container?.clientWidth as number;
    if (container) {
      const scrollAmount = direction === "left" ? -width : width;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-row items-center justify-start w-full md:w-96 relative ">
      <button
        className="absolute -left-8 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full -ml-2 transition-colors"
        onClick={() => scrollCarousel("left")}
      >
        <ChevronDots direction="left" />
      </button>

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

      <button
        className="absolute -right-8 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full flex -mr-2 transition-colors"
        onClick={() => scrollCarousel("right")}
      >
        <ChevronDots />
      </button>
    </div>
  );
}
