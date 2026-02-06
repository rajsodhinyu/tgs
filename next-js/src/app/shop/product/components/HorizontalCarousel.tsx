"use client";

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
        className="absolute -left-8 z-10 bg-tgs-pink bg-opacity-100 text-white p-1 pb-2 rounded-full -ml-2"
        onClick={() => scrollCarousel("left")}
      >
        <div className="font-title text-3xl pl-1"> &lt; </div>
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
        className="absolute -right-8 z-10 bg-tgs-pink bg-opacity-100 text-white p-1 pb-2 rounded-full flex -mr-2"
        onClick={() => scrollCarousel("right")}
      >
        <div className="font-title text-3xl pl-1">&gt;</div>
      </button>
    </div>
  );
}
