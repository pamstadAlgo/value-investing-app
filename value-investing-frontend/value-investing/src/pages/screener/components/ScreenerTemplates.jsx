import React from "react";
import SavedFilterViews from "./SavedFilterViews";
import SaveView from "../SaveView";

function ScreenerTemplates() {
  return (
    <div className="glass-card" style={{ marginBottom: "1rem" }}>
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Screener Templates
      </div>
      <div className="flex-wrapper-filter-views-compo">
        <SavedFilterViews />
        <SaveView />
      </div>
    </div>
  );
}

export default ScreenerTemplates;
