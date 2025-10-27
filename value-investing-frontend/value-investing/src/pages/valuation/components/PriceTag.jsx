import React from "react";
import { getCurrencySymbol } from "./selectorFunctions";

function PriceTag({ title, price, colorPrice, currencyCode }) {
  return (
    <div className="flexbox-wrapper-price-tag">
      <div className="title-price-tag">{title}</div>
      <div className={"price-price-tag " + colorPrice}>
        {getCurrencySymbol(currencyCode)} {price}
      </div>
    </div>
  );
}

export default PriceTag;
