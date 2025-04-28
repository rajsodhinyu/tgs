import ShopCard from "../../blog/shopCards";

export default async function Post() {
  return (
    <div>
      <div>
        <img
          className="rounded-md mt-4"
          src="https://cdn.sanity.io/images/fnvy29id/tgs/521c9db6c56c0f895d9b5cdbbd7327bef264b5a6-2669x2130.jpg?"
          alt=""
        />
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-4 mt-8 ">
        <ShopCard
          title="TGS HOODIE"
          description="top half of the TGS Lounge Set."
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/6be00cdfbf1be8e155c9551273be152650927d2a-1278x1278.jpg"
          url="/shop/product/tgs-hoodie"
        />
        <ShopCard
          title="THATGOODSH*T RING"
          description="your choice of gold or silver."
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/b2ccd1a84eaa0665a4f9369271063210f81e90bf-1278x1278.jpg"
          url="/shop/product/tgs-ring"
        />
        <ShopCard
          title="TGS PANTS"
          description="bottom half of the TGS Lounge Set."
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/3429544fecca49f998925ac6cc8785eca30f344f-1278x1278.jpg"
          url="/shop/product/tgs-pants"
        />
        <ShopCard
          title="Quintaro"
          description="quincy idk what to "
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/b4b61698e2bb56c3fb92b6d284a612a7e8ab94a0-3000x3000.jpg?h=1300&w=1300"
          url="/shop/product/quintaro"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/e01c58e7101b344fdb2e76fac3a1b8e7725873d3-1499x1499.png"
          url="/shop/product/chase-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/aadb9116913e1fdd1fd5d1bb1052ad8412e5de3b-1499x1499.png"
          url="/shop/product/shirt-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/5412a8ab860da900087faca78cb611e199d128f3-1499x1499.png"
          url="/shop/product/eagle-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/42de09b3c1251d0b1577e6392f67d7c6ed1632df-1499x1499.png"
          url="/shop/product/truest-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/e6cf23ae2881e876569f8eccfefca93fc8e7f387-1499x1499.png"
          url="/shop/product/kirti-wakai-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/4ea770df242fa3722c0a154033f2719fa8316897-1499x1499.png"
          url="/shop/product/laura-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/a65433e40dbf8fdd32fbe5f18ccfd26cb1977ea8-1499x1499.png"
          url="/shop/product/quincy-print"
        />
        <ShopCard
          title="homepage title"
          description="hpage description"
          cover="https://cdn.sanity.io/images/fnvy29id/tgs/707ba925a3f5557f68b427c6c60af577a39ac269-1499x1499.png"
          url="/shop/product/tony-print"
        />
      </div>
    </div>
  );
}
