import React from "react";
import ValuationSummaryCard from "./ValuationSummaryCard";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";

const equityValTitles = ["Value (bear)", "Value (base)", "Value (bull)"];

function ValuationSummary({
  currencyCode,
  equityVals,
  lastClosePrice,
  nrShares,
}) {
  //compute the equity value for bear, base, bull

  return (
    <div className="glass-card" style={{ marginTop: "20px" }}>
      {" "}
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Valuation Summary{" "}
        <span className="title-last-close-price">
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
        {/* <ValuationSummaryCard
          currencyCode="USD"
          colorPrice="overvalued"
          price={1000}
          title="Value (bear)"
        />
        <ValuationSummaryCard
          currencyCode="USD"
          colorPrice="undervalued"
          price={2000}
          title="Value (base)"
        />
        <ValuationSummaryCard
          currencyCode="USD"
          colorPrice="undervalued"
          price={3000}
          title="Value (bull)"
        />
        <ValuationSummaryCard
          currencyCode="USD"
          colorPrice="undervalued"
          price={1000}
          title="Value (bear)"
        /> */}
      </div>
    </div>
  );
}

export default ValuationSummary;
