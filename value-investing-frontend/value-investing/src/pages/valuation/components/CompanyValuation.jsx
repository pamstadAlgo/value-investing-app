import React from "react";
import ToggleButtonsValuation from "./ToggleButtonsValuation";
import ValuationAccordion from "./ValuationAccordion";

function CompanyValuation({ epvData, qfsSymbol }) {
  return (
    <div style={{ marginBottom: "64px" }}>
      <ToggleButtonsValuation />
      <ValuationAccordion epvData={epvData} qfsSymbol={qfsSymbol} />
      {/* <div>button grou</div> */}
      {/* <div>EPV accordion</div>
      <div>Penman Accordion</div> */}
    </div>
  );
}

export default CompanyValuation;
