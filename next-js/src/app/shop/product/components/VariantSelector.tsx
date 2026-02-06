"use client";

import { useState } from "react";
import Form from "next/form";
import type { Variant } from "@/lib/shopify";

function variantIdNum(id: string) {
  return id.replace("gid://shopify/ProductVariant/", "");
}

function formatPrice(amount: string) {
  const num = parseFloat(amount);
  return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`;
}

export default function VariantSelector({ variants }: { variants: Variant[] }) {
  const firstAvailable = variants.find((v) => v.availableForSale);
  const [selected, setSelected] = useState(firstAvailable?.id ?? variants[0]?.id);

  const selectedVariant = variants.find((v) => v.id === selected);
  const allSamePrice = variants.every(
    (v) => v.price.amount === variants[0]?.price.amount
  );

  // Detect grouped variants (e.g. "Silver / 6", "Gold / 7")
  const hasGroups = variants.some((v) => v.title.includes(" / "));

  const groups: Record<string, Variant[]> = {};
  if (hasGroups) {
    for (const v of variants) {
      const [group] = v.title.split(" / ");
      if (!groups[group]) groups[group] = [];
      groups[group].push(v);
    }
  }

  const renderVariantButton = (v: Variant, label: string, isFirst: boolean) => {
    const soldOut = !v.availableForSale;
    const idNum = variantIdNum(v.id);

    return (
      <label key={v.id} className={soldOut ? "opacity-40 cursor-not-allowed" : ""}>
        <input
          className="sr-only peer"
          name="size"
          type="radio"
          value={idNum}
          disabled={soldOut}
          checked={selected === v.id}
          onChange={() => setSelected(v.id)}
        />
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm
            ${soldOut
              ? "text-gray-400 line-through"
              : "text-tgs-purple peer-checked:bg-tgs-purple peer-checked:text-white"
            }`}
        >
          {label}
        </div>
      </label>
    );
  };

  return (
    <div className="flex font-title">
      <Form action="/shop/cart/add">
        <div className="flex">
          <div className="w-full flex-none mt-2 order-1 text-4xl sm:text-5xl font-bold text-tgs-purple">
            {allSamePrice
              ? formatPrice(variants[0].price.amount)
              : formatPrice(selectedVariant?.price.amount ?? variants[0].price.amount)}
          </div>
        </div>
        <div className="flex items-baseline mt-4 pb-6 place-content-center">
          <div className="space-x-2 flex text-sm font-bold">
            {hasGroups ? (
              Object.entries(groups).map(([groupName, groupVariants]) => (
                <div key={groupName}>
                  <div className="mb-3 text-tgs-purple">{groupName.toUpperCase()}</div>
                  {groupVariants.map((v, i) => {
                    const label = v.title.split(" / ")[1];
                    return renderVariantButton(v, label, i === 0);
                  })}
                </div>
              ))
            ) : (
              variants.map((v, i) => {
                const label = v.title === "Default Title" ? v.title : v.title;
                return renderVariantButton(v, label, i === 0);
              })
            )}
          </div>
        </div>
        <div className="flex space-x-4 mb-5 text-sm font-medium">
          <div className="flex-auto flex space-x-4 place-content-center">
            <button
              className="h-10 px-6 rounded-full bg-tgs-purple text-white disabled:opacity-40"
              type="submit"
              disabled={!firstAvailable}
            >
              {firstAvailable ? "ADD TO CART" : "SOLD OUT"}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
