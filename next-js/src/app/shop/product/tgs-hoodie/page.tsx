import { getProduct } from "@/lib/shopify";
import HorizontalCarousel from "../components/HorizontalCarousel";
import VariantSelector from "../components/VariantSelector";

const images = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/074edb4f6440d1ea2d0357c9d2df57a0cb6d0259-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/e6eae2708b82e5b582ba4ecdb73163b198f552f9-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/9cb2a0b8636707c1f6d68524402abc273d8cfe29-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/074edb4f6440d1ea2d0357c9d2df57a0cb6d0259-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/e6eae2708b82e5b582ba4ecdb73163b198f552f9-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/9cb2a0b8636707c1f6d68524402abc273d8cfe29-800x1000.png",
];

export default async function Page() {
  const variants = await getProduct("tgs-hoodie");

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
          The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit
          featuring reverse appliqué artwork hand drawn by us.
        </div>
      </div>
    </div>
  );
}
