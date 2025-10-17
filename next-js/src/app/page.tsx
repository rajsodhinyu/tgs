"use client";
import * as React from "react";

export default function TourPage() {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress((prev) => {
        const delta = e.deltaY * 0.001;
        return Math.max(0, Math.min(1, prev + delta));
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      (e.target as any).touchStartY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const startY = (e.target as any).touchStartY || touch.clientY;
      const delta = (startY - touch.clientY) * 0.002;
      setScrollProgress((prev) => Math.max(0, Math.min(1, prev + delta)));
      (e.target as any).touchStartY = touch.clientY;
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Background with angled split */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#08A0EF]"></div>
        <div
          className="absolute inset-0 bg-[#B1DF92] z-10"
          style={{
            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 80% 100%)",
          }}
        ></div>
      </div>

      {/* Image */}
      <div className="absolute inset-0 z-20 overflow-visible">
        <img
          src="/tour-map5.png"
          alt="West Coast Tour Map"
          className="absolute inset-0 w-full h-full object-cover xl:object-contain max-sm:hidden"
        />
        <img
          src="/tour-map-mobile4.png"
          alt="West Coast Tour Map Mobile"
          className="absolute inset-0 w-full h-full object-cover sm:hidden pointer-events-none"
        />
      </div>

      {/* Left names image */}
      <a
        href="/home"
        className="max-sm:hidden absolute left-0 top-0 w-auto h-full ml-3 z-30"
      >
        <img
          src="/left-names.png"
          alt="Left Names"
          className="h-full object-contain origin-left sm:scale-75 xl:scale-90"
        />
      </a>

      {/* Left no names image - Mobile */}
      <a
        href="/home"
        className="sm:hidden absolute left-0 top-0 w-auto h-1/5 mt-3 ml-3 z-30"
      >
        <img
          src="/leftnonames.png"
          alt="Left"
          className="h-full object-contain origin-left"
        />
      </a>

      {/* Mobile tour stop images - top right */}
      <div className="sm:hidden absolute top-0 right-0 z-30 flex flex-col items-end p-1 space-y-2">
        <a
          href="https://www.axs.com/events/1183946/wynne-tickets?skin=barboza"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/seattle.png" alt="Seattle" className="w-auto h-16" />
        </a>
        <a
          href="https://www.ticketweb.com/event/that-good-sht-star-theater-tickets/14625533?pl=star"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/portland2.png" alt="Portland" className="w-auto h-16" />
        </a>

        <img
          src="/signup.png"
          alt="Sign Up"
          className="w-auto invisible h-[30px]"
        />

        <a
          href="https://laylo.com/tgs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/signup.png" alt="Sign Up" className="w-auto h-24" />

          <img
            src="/signup.png"
            alt="Sign Up"
            className="w-auto invisible h-[20px]"
          />
        </a>
        <a
          href="https://www.ticketweb.com/event/maxo-annabelle-igwe-aka-quincy-brick-and-mortar-music-hall-tickets/14624133?pl=bnm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/sf2.png" alt="San Francisco" className="w-auto h-20" />
        </a>
      </div>

      {/* Mobile tour stop images - bottom left */}
      <div className="sm:hidden absolute bottom-28 right-0 z-30 flex flex-col items-end p-4 space-y-6">
        <a
          href="https://www.pi.fyi/event/cmgu7f29i01q0p53tiugwis2l"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/neapolishit2.png"
            alt="Neapolishit"
            className="w-[350px]"
          />
        </a>
        <a
          href="https://www.ticketmaster.com/event/0900634F3A568A8C"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/la2.png" alt="LA" className="w-[270px]" />
        </a>
      </div>

      {/* Desktop tour stop images - positioned individually */}
      {/* Sign up - top right */}
      <a href="https://laylo.com/tgs" target="_blank" rel="noopener noreferrer">
        <img
          src="/signup-desktop.png"
          alt="Sign Up"
          className="max-sm:hidden absolute top-0 right-0 z-30 w-auto h-32 lg:h-40 xl:h-64 "
        />
      </a>
      {/* Seattle - top, quarter from right */}
      <a
        href="https://www.axs.com/events/1183946/wynne-tickets?skin=barboza"
        target="_blank"
        rel="noopener noreferrer"
        className="max-sm:hidden absolute top-14 right-[18%] xl:right-[25%] z-30"
      >
        <img
          src="/seattle.png"
          alt="Seattle"
          className="w-auto h-20 lg:h-24 xl:h-36"
        />
      </a>

      {/* Portland - below Seattle, slightly right */}
      <a
        href="https://www.ticketweb.com/event/that-good-sht-star-theater-tickets/14625533?pl=star"
        target="_blank"
        rel="noopener noreferrer"
        className="max-sm:hidden absolute top-40 right-[10%] xl:top-52 xl:right-[10%] z-30"
      >
        <img
          src="/portland2.png"
          alt="Portland"
          className="w-auto h-20 lg:h-28 xl:h-36"
        />
      </a>

      {/* SF - center right */}
      <a
        href="https://www.ticketweb.com/event/maxo-annabelle-igwe-aka-quincy-brick-and-mortar-music-hall-tickets/14624133?pl=bnm"
        target="_blank"
        rel="noopener noreferrer"
        className="max-sm:hidden absolute bottom-[40%] right-[5%] xl:top-[55%] xl:right-0 z-30"
      >
        <img
          src="/sf-desktop.png"
          alt="San Francisco"
          className="w-auto h-14 lg:h-20 xl:h-24"
        />
      </a>

      {/* Neapolishit - bottom right area */}
      <a
        href="https://www.pi.fyi/event/cmgu7f29i01q0p53tiugwis2l"
        target="_blank"
        rel="noopener noreferrer"
        className="max-sm:hidden absolute bottom-36 xl:bottom-44 right-5 z-30"
      >
        <img
          src="/neapolishit2.png"
          alt="Neapolishit"
          className="w-auto h-14 lg:h-20 xl:h-24"
        />
      </a>

      {/* LA - bottom right, below Neapolishit */}
      <a
        href="https://www.ticketmaster.com/event/0900634F3A568A8C"
        target="_blank"
        rel="noopener noreferrer"
        className=" absolute bottom-12  right-5 z-30"
      >
        <img src="/la2.png" alt="LA" className="w-auto  h-14 lg:h-20 xl:h-24" />
      </a>

      {/* Van animated along path - Desktop */}
      <svg
        className="max-sm:hidden absolute inset-0 w-full h-full pointer-events-none z-[25]"
        viewBox="0 0 1280 832"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path
            id="roadPathDesktop"
            d="M760.5 177.5C766.5 145.5 768.3 81.1 727.5 79.5C676.5 77.5 665.5 238 671 266C675.4 288.4 688.631 363.417 709 388.5C751.227 440.5 847.3 525.6 834.5 598C821.7 670.4 881.933 709.181 908 729C940.959 754.059 983.7 805.2 984.5 828"
          />
        </defs>
        <g>
          <image
            href="/van2.png"
            width="100"
            height="100"
            x="-30"
            y="-30"
            style={{
              offsetPath:
                "path('M760.5 177.5C766.5 145.5 768.3 81.1 727.5 79.5C676.5 77.5 665.5 238 671 266C675.4 288.4 688.631 363.417 709 388.5C751.227 440.5 847.3 525.6 834.5 598C821.7 670.4 881.933 709.181 908 729C940.959 754.059 983.7 805.2 984.5 828')",
              offsetDistance: `${scrollProgress * 100}%`,
              offsetRotate: "auto",
            }}
          />
        </g>
      </svg>

      {/* Van animated along path - Mobile */}
      <svg
        className="sm:hidden absolute inset-0 w-full h-full pointer-events-none z-[25]"
        viewBox="0 0 396 852"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path
            id="roadPathMobile"
            d="M223 220C228.833 178.5 225.7 111.3 166.5 174.5C155.167 227.333 146.4 348.4 202 410C225.667 420.833 274.4 458.1 280 520.5C287 598.5 293 618 346.5 646C389.3 668.4 367 658 350.5 650L415.5 735"
          />
        </defs>
        <g>
          <image
            href="/van2.png"
            width="80"
            height="80"
            x="-20"
            y="-20"
            style={{
              offsetPath:
                "path('M193 200C228.833 178.5 225.7 111.3 166.5 174.5C155.167 227.333 146.4 348.4 202 410C225.667 420.833 274.4 458.1 280 520.5C287 598.5 293 618 346.5 646C389.3 668.4 367 658 350.5 650L415.5 735')",
              offsetDistance: `${scrollProgress * 100}%`,
              offsetRotate: "auto",
            }}
          />
        </g>
      </svg>
    </div>
  );
}
