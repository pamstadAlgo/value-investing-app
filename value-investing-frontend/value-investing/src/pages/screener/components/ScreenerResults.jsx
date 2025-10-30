import React from "react";
import DataView from "./DataView";

function ScreenerResults() {
  return (
    <div className="grid-wrapper-screener">
      <div className="glass-card screener-results-grid-item">
        {" "}
        <div className="title-mid-size" style={{ marginBottom: "20px" }}>
          Screener Results
        </div>
        <DataView />
      </div>
    </div>
  );
}

export default ScreenerResults;
