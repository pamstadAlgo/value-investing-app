import React from "react";
import ValuationSummaryCard from "./ValuationSummaryCard";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";
import { useSelector } from "react-redux";
import { computeNetLiqValue } from "./selectorFunctions";
import SaveValuationModel from "./SaveValuationModel";

const equityValTitles = [
  "Equity Val (bear)",
  "Equity Val (base)",
  "Equity Val (bull)",
];

function ValuationSummary({
  currencyCode,
  equityVals,
  lastClosePrice,
  nrShares,
  qfsSymbol,
}) {
  //compute the equity value for bear, base, bull
  const netLiqValue = useSelector((state) =>
    computeNetLiqValue(state.analysis?.balanceSheet)
  );

  const netLiqValuePerShare = netLiqValue / nrShares;

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
        <SaveValuationModel />
      </div>
      <div className="flex-wrapper-valuation-summary">
        {equityVals?.map((val, index) => {
          let valPerShare = val / nrShares;
          return (
            <ValuationSummaryCard
              currencyCode={currencyCode}
              title={equityValTitles[index]}
              price={valPerShare.toFixed(2)}
              marginOfSafety={(
                ((valPerShare - lastClosePrice) / lastClosePrice) *
                100
              ).toFixed(1)}
              colorPrice={
                valPerShare > lastClosePrice ? "undervalued" : "overvalued"
              }
            />
          );
        })}
        {/* liquidation value */}
        <ValuationSummaryCard
          currencyCode={currencyCode}
          title="Net Liq. Value (per share)"
          price={netLiqValuePerShare.toFixed(2)}
          marginOfSafety={(
            ((netLiqValuePerShare - lastClosePrice) / lastClosePrice) *
            100
          ).toFixed(1)}
          colorPrice={
            netLiqValuePerShare > lastClosePrice ? "undervalued" : "overvalued"
          }
        />
      </div>
    </div>
  );
}

export default ValuationSummary;
