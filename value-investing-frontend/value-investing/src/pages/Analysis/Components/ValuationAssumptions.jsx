import React from "react";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  changeNrShares,
  changeTaxRate,
  changeTerminalGrowthRate,
  changeWacc,
} from "../../../features/analysisSlice";

function ValuationAssumptions({ scalingFactor }) {
  const analysisData = useSelector((state) => state.analysis);

  const dispatch = useDispatch();
  return (
    <div className="glass-card" style={{ marginTop: "20px" }}>
      {" "}
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Valuation Assumptions
      </div>
      <div className="valuation-inputs-flex-wrapper">
        <TextField
          type="number"
          size="small"
          placeholder="0.25"
          label="Tax Rate"
          value={analysisData.taxRate}
          onChange={(e) => dispatch(changeTaxRate(Number(e.target.value)))}
        />
        <TextField
          type="number"
          size="small"
          placeholder="0.1"
          label="Cost of Capital (WACC)"
          value={analysisData.wacc}
          onChange={(e) => dispatch(changeWacc(Number(e.target.value)))}
        />
        <TextField
          type="number"
          size="small"
          placeholder="0.02"
          label="Terminal Growth Rate"
          value={analysisData.terminalGrowthRate}
          onChange={(e) => dispatch(changeTerminalGrowthRate(Number(e.target.value)))}
        />
        <TextField
          type="number"
          size="small"
          placeholder="10"
          label={`Nr of Shares (${
            scalingFactor === "1000000" ? "Millions" : "Thousands"
          })`}
          value={analysisData?.companyData.nrShares / scalingFactor}
          onChange={(e) =>
            dispatch(changeNrShares(e.target.value * scalingFactor))
          }
        />
      </div>
    </div>
  );
}

export default ValuationAssumptions;
