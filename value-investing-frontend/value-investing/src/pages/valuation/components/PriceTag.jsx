import React from "react";

function PriceTag({ title, price, colorPrice }) {
  return (
    <div className="flexbox-wrapper-price-tag">
      <div className="title-price-tag">{title}</div>
      <div className={"price-price-tag " + colorPrice}>$ {price}</div>
    </div>
  );
}

export default PriceTag;
