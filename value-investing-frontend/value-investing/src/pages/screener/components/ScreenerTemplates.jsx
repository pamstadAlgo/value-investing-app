import React from "react";
import SavedFilterViews from "./SavedFilterViews";
import SaveView from "../SaveView";

function ScreenerTemplates() {
  return (
    <div className="glass-card screener-templates-flex-wrapper">
      <div className="title-mid-size">Screener Templates</div>
      <div className="flex-wrapper-filter-views-compo">
        <SavedFilterViews />
        <SaveView />
      </div>
    </div>
  );
}

export default ScreenerTemplates;
