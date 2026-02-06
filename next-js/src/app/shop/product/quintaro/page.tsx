import { getProduct } from "@/lib/shopify";
import HorizontalCarousel from "../components/HorizontalCarousel";
import VariantSelector from "../components/VariantSelector";

const images = [
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/fd3bcb361dee60f3210141579ceaccf4a59ae830-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/06a07e85a9cf836247167f94ef19be4616c70e1e-2726x3408.png?h=1000",
  "https://cdn.sanity.io/images/fnvy29id/tgs/c925c377687bf7dfbce08c9e9a733b3033e88f7d-2726x3408.png?h=1000",
];

export default async function Page() {
  const [dvdVariants, cdVariants] = await Promise.all([
    getProduct("quintaro-dvd"),
    getProduct("quintaro-cd"),
  ]);

  // Combine into a single variant list with readable titles
  const variants = [
    ...dvdVariants.map((v) => ({ ...v, title: "DVD" })),
    ...cdVariants.map((v) => ({ ...v, title: "CD" })),
  ];

  return (
    <div>
      <br />
      <div
        className="text-center font-title font-bold
          text-4xl md:text-5xl text-tgs-purple max-[340px]:w-80 w-full
        "
      >
        Quintaro
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
        <div className="text-2xl font-bit font-bold text-pretty sm:w-5/6 text-left py-12">
          <p>Quincy Davis - Quintaro</p>
          <p>Format: DVD-R</p>
          <p>Runtime: 28m</p>
          <p>
            <br></br>
          </p>
          <p>
            Quintaro is about moving forward, climbing impossible heights, and
            perseverance through daydreams. The visualizer for this album is a
            biking edit, a surrealistic glitch collage, a multi-multi-media
            piece created by Quincy Davis and Raj Sodhi. The DVD was made for
            you to put into your Playstation when you&apos;re on your couch or with
            the homies while you work or relax.
          </p>
          <p>
            <br></br>
          </p>
          <p>Album: Quincy Davis</p>
          <p>Edit/VFX: Raj Sodhi (@juulwry) + Quincy Davis (@quincydaviss)</p>
          <p>Footage: Raj Sodhi + Ria Mehrotra (@ria.mehrotra)</p>
          <p>Album and DVD Covers: Virgil Warren (@vw_studio5)</p>
        </div>
      </div>
    </div>
  );
}
