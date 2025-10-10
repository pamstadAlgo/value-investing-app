import React from "react";
import FiltersCard from "./FiltersCard";
import ScreenerResults from "./ScreenerResults";

function Screener() {
  return (
    <div className="grid-wrapper-screener">
      <FiltersCard />
      <ScreenerResults />
    </div>
  );
}

export default Screener;
