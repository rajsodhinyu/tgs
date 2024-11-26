

const cards = [
    "https://cdn.sanity.io/images/fnvy29id/tgs/7486e4a90f1e3108c32966ffa1cd24d07394f6c8-2100x2628.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f128efa4d7545273800504eca5734c3da4a3eb4f-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/3b27f29561b621f8ae783c84688f3f52ea463efd-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/ba150eb896964bcba1cc41b2578bf679462055dd-2048x2560.jpg",
  ];

const HorizontalCarousel = () => {
    return (
      <div className="flex flex-col items-center justify-start w-96">
        <div className="flex overflow-x-scroll snap-x snap-mandatory rounded-lg">
          {cards.map((data, index) => {
            return (
              <section
                className="flex-shrink-0 snap-center justify-center items-center"
                key={index}
              >
                <img
                  src={data}
                  alt="Images to scroll horizontal"
                  className="w-full h-[500px]"
                />
              </section>
            );
          })}
        </div>
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
                {<HorizontalCarousel></HorizontalCarousel>}
                
            </div>
            <div className="w-11/12 place-self-center text-center align-center text-black text-balance text-sm lg:text-lg font-semibold font-roc leading-none pt-2">hi</div>
            <div className="">
                
            </div>
        </div>
        
    </div>)
}