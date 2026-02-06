import { getProduct } from "@/lib/shopify";
import HorizontalCarousel from "../components/HorizontalCarousel";
import VariantSelector from "../components/VariantSelector";

const images = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6f00d0ca0c8bdb783cc4d4ad0e3e5ea1b20d3921-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6f00d0ca0c8bdb783cc4d4ad0e3e5ea1b20d3921-800x1000.png",
];

export default async function Page() {
  const variants = await getProduct("thatgoodsh-t-ring");

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
          <HorizontalCarousel cards={images} />
          <div></div>
        </div>

        <div className="flex text-center place-self-center text-black text-balance text-sm md:text-lg pt-2">
          <VariantSelector variants={variants} />
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
