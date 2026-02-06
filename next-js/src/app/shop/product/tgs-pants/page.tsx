import { getProduct } from "@/lib/shopify";
import HorizontalCarousel from "../components/HorizontalCarousel";
import VariantSelector from "../components/VariantSelector";

const images = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/f257ca192915a29bdd3dd0e9525a419bc1b348c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6060cdd55e467e09f499ee923ad0d6196dc8af71-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/3907a5a1c363e8eab6b5cdbee014892da193a3fd-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/f257ca192915a29bdd3dd0e9525a419bc1b348c4-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/6060cdd55e467e09f499ee923ad0d6196dc8af71-800x1000.png",
  "https://cdn.sanity.io/images/fnvy29id/tgs/3907a5a1c363e8eab6b5cdbee014892da193a3fd-800x1000.png",
];

export default async function Page() {
  const variants = await getProduct("tgs-sweatpants");

  return (
    <div>
      <br />
      <div
        className="text-center font-title font-bold
          text-4xl md:text-5xl text-tgs-purple max-[340px]:w-80 w-full
        "
      >
        Lounge Pant
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
