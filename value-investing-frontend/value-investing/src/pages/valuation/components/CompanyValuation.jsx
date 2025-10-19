import React from "react";
import ToggleButtonsValuation from "./ToggleButtonsValuation";
import ValuationAccordion from "./ValuationAccordion";

function CompanyValuation() {
  return (
    <div>
      <ToggleButtonsValuation />
      <ValuationAccordion />
      {/* <div>button grou</div> */}
      <div>EPV accordion</div>
      <div>Penman Accordion</div>
    </div>
  );
}

export default CompanyValuation;
