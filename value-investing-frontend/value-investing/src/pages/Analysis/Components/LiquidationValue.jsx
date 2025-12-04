import React from "react";
import ToggleButtonsScaling from "./ToggleButtonsScaling";
import AssetTable from "./AssetTable";
import LiabilitiesTable from "./LiabilitiesTable";
import ValuationSummaryCard from "./ValuationSummaryCard";
import { useSelector } from "react-redux";
import { computeNetLiqValue } from "./selectorFunctions";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";

const tableColumnWidths = ["50%", "20%", "10%", "15%"];

function LiquidationValue({
  qfsSymbol,
  scaling,
  handleToggleButtonChange,
  currencyCode,
  nrShares,
  lastClosePrice,
}) {
  const netLiqValue = useSelector((state) =>
    computeNetLiqValue(state.analysis?.balanceSheet)
  );

  console.log("net liq value: ", netLiqValue);
  console.log("nrShares: ", nrShares);

  const valPerShare = netLiqValue / nrShares;

  return (
    <div style={{ marginTop: "32px" }}>
      {" "}
      <div className="button-group-wrapper">
        <ToggleButtonsScaling
          value={scaling}
          handleChange={handleToggleButtonChange}
        />
      </div>
      <div className="glass-card" style={{ marginTop: "12px" }}>
        <div className="title-mid-size" style={{ marginBottom: "20px" }}>
          Liquidation Valuation Analysis {qfsSymbol}{" "}
          <span
            className="title-last-close-price"
            style={{ fontSize: "14px", marginLeft: "10px" }}>
            (Last Close Price: {getCurrencySymbol(currencyCode)}{" "}
            {lastClosePrice})
          </span>
        </div>
        <div
          className="flex-wrapper-valuation-summary"
          style={{ marginBottom: "20px" }}>
          <ValuationSummaryCard
            currencyCode={currencyCode}
            title="Net Liq. Value (per share)"
            price={valPerShare.toFixed(2)}
            colorPrice={
              valPerShare > lastClosePrice ? "undervalued" : "overvalued"
            }
          />
        </div>

        <div className="liquidation-value-flex-wrapper">
          <AssetTable tableColumnWidths={tableColumnWidths} scaling={scaling} />
          <LiabilitiesTable
            tableColumnWidths={tableColumnWidths}
            scaling={scaling}
          />
        </div>
      </div>
    </div>
  );
}

export default LiquidationValue;
