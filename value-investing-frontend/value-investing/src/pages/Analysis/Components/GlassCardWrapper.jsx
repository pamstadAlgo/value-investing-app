import React from "react";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";
import ValuationModelDefinition from "./ValuationModelDefinition";
import ValuationApproachSelect from "./ValuationApproachSelect";

function GlassCardWrapper({
  children,
  title,
  currencyCode,
  lastClosePrice,
  qfsSymbol,
}) {
  return (
    <div className="glass-card" style={{ marginTop: "12px" }}>
      <div
        className="title-mid-size"
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          justifyContent: "space-between",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {title} {qfsSymbol}
          <ValuationModelDefinition />
          {
            <span
              className="title-last-close-price"
              style={{ fontSize: "14px" }}>
              (Last Close Price: {getCurrencySymbol(currencyCode)}{" "}
              {lastClosePrice})
            </span>
          }
        </div>
        <ValuationApproachSelect />
      </div>
      {children}
    </div>
  );
}

export default GlassCardWrapper;
