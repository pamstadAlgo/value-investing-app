import React from "react";
import ValuationSummaryCard from "./ValuationSummaryCard";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";

const equityValTitles = ["Value (bear)", "Value (base)", "Value (bull)"];

function ValuationSummary({
  currencyCode,
  equityVals,
  lastClosePrice,
  nrShares,
  qfsSymbol,
}) {
  //compute the equity value for bear, base, bull

  return (
    <div className="glass-card" style={{ marginTop: "20px" }}>
      {" "}
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Valuation Summary {qfsSymbol}
        <span
          className="title-last-close-price"
          style={{ fontSize: "14px", marginLeft: "10px" }}>
          (Last Close Price: {getCurrencySymbol(currencyCode)} {lastClosePrice})
        </span>
      </div>
      <div className="flex-wrapper-valuation-summary">
        {equityVals?.map((val, index) => {
          let valPerShare = val / nrShares;
          return (
            <ValuationSummaryCard
              currencyCode={currencyCode}
              title={equityValTitles[index]}
              price={valPerShare.toFixed(2)}
              colorPrice={
                valPerShare > lastClosePrice ? "undervalued" : "overvalued"
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default ValuationSummary;
