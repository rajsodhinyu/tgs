import ShopCard from "../../blog/shopCards"



export default async function Post() {

  
  return (<div >
    


    <div ><img className="rounded-md mt-4" src="https://cdn.sanity.io/images/fnvy29id/tgs/521c9db6c56c0f895d9b5cdbbd7327bef264b5a6-2669x2130.jpg?" alt="" /></div>
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mt-8">
      <div className="hover:underline decoration-tgs-purple">
        <ShopCard title='TGS HOODIE' description='top half of the TGS Lounge Set.' cover="https://cdn.sanity.io/images/fnvy29id/tgs/6be00cdfbf1be8e155c9551273be152650927d2a-1278x1278.jpg" url="/shop/product/tgs-hoodie"></ShopCard>
      </div>
      <div className="hover:underline decoration-tgs-purple">
        <ShopCard title='THATGOODSH*T RING' description='your choice of gold or silver.' cover="https://cdn.sanity.io/images/fnvy29id/tgs/b2ccd1a84eaa0665a4f9369271063210f81e90bf-1278x1278.jpg" url="/shop/product/tgs-ring"></ShopCard>
      </div>
      <div className="hover:underline decoration-tgs-purple">
        <ShopCard title='TGS PANTS' description='bottom half of the TGS Lounge Set.' cover="https://cdn.sanity.io/images/fnvy29id/tgs/3429544fecca49f998925ac6cc8785eca30f344f-1278x1278.jpg" url="/shop/product/tgs-pants"></ShopCard>
      </div>
    </div>
  </div>)
}