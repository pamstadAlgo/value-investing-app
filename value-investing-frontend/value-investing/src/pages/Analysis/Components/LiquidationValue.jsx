import React from "react";
import ToggleButtonsScaling from "./ToggleButtonsScaling";
import AssetTable from "./AssetTable";
import LiabilitiesTable from "./LiabilitiesTable";

const tableColumnWidths = ["57%", "20%", "3%", "15%"];

function LiquidationValue({ qfsSymbol, scaling, handleToggleButtonChange }) {
  return (
    <>
      {" "}
      <div className="button-group-wrapper">
        <ToggleButtonsScaling
          value={scaling}
          handleChange={handleToggleButtonChange}
        />
      </div>
      <div className="liquidation-value-flex-wrapper">
        <AssetTable tableColumnWidths={tableColumnWidths} scaling={scaling} />
        <LiabilitiesTable
          tableColumnWidths={tableColumnWidths}
          scaling={scaling}
        />
      </div>
    </>
  );
}

export default LiquidationValue;
