import React from "react";

function ValuationSubCard({ title, value, currency, rounding }) {
  return (
    <div className="flex-item-card-wrapper">
      <div className="title-value">{title}</div>
      <div>
        {value?.toFixed(rounding)} {currency ? currency : ""}
      </div>
    </div>
  );
}

export default ValuationSubCard;
