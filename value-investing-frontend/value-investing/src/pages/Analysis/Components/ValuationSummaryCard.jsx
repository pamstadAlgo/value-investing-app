import React from "react";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";
import PriceTag from "../../valuation/components/PriceTag";

function ValuationSummaryCard({
  currencyCode,
  title,
  price,
  colorPrice,
  marginOfSafety,
}) {
  return (
    <div className="valuation-summary-card">
      <PriceTag
        title={title}
        currencyCode={currencyCode}
        price={price}
        colorPrice={colorPrice}
      />
      <div className="margin-of-safety-section">
        MoS:{" "}
        <span
          className={colorPrice}
          style={{ backgroundColor: "transparent", fontSize: "16px" }}>
          {" "}
          {marginOfSafety > 0 ? "+" : "-"}
          {marginOfSafety} %
        </span>
      </div>
    </div>
  );
}

export default ValuationSummaryCard;
