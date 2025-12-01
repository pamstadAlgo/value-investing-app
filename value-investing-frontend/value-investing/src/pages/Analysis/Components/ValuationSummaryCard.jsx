import React from "react";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";
import PriceTag from "../../valuation/components/PriceTag";

function ValuationSummaryCard({ currencyCode, title, price, colorPrice }) {
  return (
    <div className="valuation-summary-card">
      <PriceTag
        title={title}
        currencyCode={currencyCode}
        price={price}
        colorPrice={colorPrice}
      />
    </div>
  );
}

export default ValuationSummaryCard;
