const cards = [
    "https://cdn.sanity.io/images/fnvy29id/tgs/7486e4a90f1e3108c32966ffa1cd24d07394f6c8-2100x2628.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/f128efa4d7545273800504eca5734c3da4a3eb4f-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/3b27f29561b621f8ae783c84688f3f52ea463efd-2048x2560.jpg",
    "https://cdn.sanity.io/images/fnvy29id/tgs/ba150eb896964bcba1cc41b2578bf679462055dd-2048x2560.jpg",
  ];

const HorizontalCarousel = () => {
    return (
      <div className="flex flex-col items-center justify-center w-96">
        <div className="flex overflow-x-scroll snap-x snap-mandatory max-w-xl rounded-lg">
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
        <div className="text-4xl font-roc">
            TGS Hoodie
        </div>
        <div className="items-center flex justify-between">
            {<HorizontalCarousel></HorizontalCarousel>}
        </div>
        {/* <div className="inline-flex">
            <div className="snap-x flex">
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1622890806166-111d7f6c7c97?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1575424909138-46b05e5919ec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
                <div className="snap-center flex">
                    <img src="https://images.unsplash.com/photo-1559333086-b0a56225a93c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80" />
                </div>
            </div>
        </div> */}
    </div>)
}