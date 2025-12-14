import React from "react";
import { getCurrencySymbol } from "../../valuation/components/selectorFunctions";
import ValuationModelDefinition from "./ValuationModelDefinition";

function GlassCardWrapper({
  children,
  title,
  currencyCode,
  lastClosePrice,
  qfsSymbol,
  headerAction,
}) {
  return (
    <div className="glass-card" style={{ marginTop: "12px" }}>
      <div
        className="title-mid-size"
        style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
        {title} {qfsSymbol}
        <ValuationModelDefinition />
        {
          <span
            className="title-last-close-price"
            style={{ fontSize: "14px", marginLeft: "10px" }}>
            (Last Close Price: {getCurrencySymbol(currencyCode)}{" "}
            {lastClosePrice})
          </span>
        }
        {headerAction && (
          <div style={{ marginLeft: "auto" }}>
            {headerAction}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default GlassCardWrapper;
