import React, { useState } from "react";
import ToggleButtonsValuation from "./ToggleButtonsValuation";
import ValuationAccordion from "./ValuationAccordion";

function CompanyValuation({ epvData, qfsSymbol }) {
  const [valuationMethod, setValuationMethod] = useState("av");

  const handleToggleButtonChange = (e, newValue) => {
    // null check enforces that always one value is selected
    if (newValue !== null) {
      setValuationMethod(newValue);
    }
  };

  return (
    <div style={{ marginBottom: "64px" }}>
      <ToggleButtonsValuation
        handleChange={handleToggleButtonChange}
        value={valuationMethod}
      />
      <ValuationAccordion
        epvData={epvData}
        qfsSymbol={qfsSymbol}
        valuationMethod={valuationMethod}
      />
      {/* <div>button grou</div> */}
      {/* <div>EPV accordion</div>
      <div>Penman Accordion</div> */}
    </div>
  );
}

export default CompanyValuation;
