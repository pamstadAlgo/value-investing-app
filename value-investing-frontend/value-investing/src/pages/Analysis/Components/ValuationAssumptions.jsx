import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  changeNrShares,
  changeTaxRate,
  changeTerminalGrowthRate,
  changeWacc,
} from "../../../features/analysisSlice";
import Tooltip from "@mui/material/Tooltip";

function ValuationAssumptions({ scalingFactor }) {
  const analysisData = useSelector((state) => state.analysis);
  const [errorTax, setErrorTax] = useState(false);
  const [errorWacc, setErrorWacc] = useState(false);
  const [errorG, setErrorG] = useState(false);
  const dispatch = useDispatch();

  function handleChange(e, sliceFunction, metric) {
    const val = e.target.value;

    //check if value is valid: We want to allow the user to clear the input field event though empty value is not a valid value
    if (isNaN(Number(e.target.valueAsNumber))) {
      dispatch(sliceFunction(val));

      // set error
      switch (metric) {
        case "tax":
          setErrorTax(true);
          break;
        case "wacc":
          setErrorWacc(true);
          break;
        case "g":
          setErrorG(true);
          break;
      }
    } else {
      dispatch(sliceFunction(e.target.valueAsNumber / 100));

      // set error
      switch (metric) {
        case "tax":
          setErrorTax(false);
          break;
        case "wacc":
          setErrorWacc(false);
          break;
        case "g":
          setErrorG(false);
          break;
      }
    }
  }

  return (
    <div className="glass-card" style={{ marginTop: "20px" }}>
      {" "}
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Valuation Assumptions
      </div>
      <div className="valuation-inputs-flex-wrapper">
        <Tooltip
          placement="right-start"
          arrow
          open={errorTax}
          title="Invalid number">
          <TextField
            type="number"
            size="small"
            placeholder="25"
            label="Tax Rate [%]"
            value={
              analysisData.taxRate
                ? analysisData.taxRate * 100
                : analysisData.taxRate
            }
            onChange={(e) => {
              handleChange(e, changeTaxRate, "tax");
            }}
          />
        </Tooltip>
        <Tooltip
          placement="right-start"
          arrow
          open={errorWacc}
          title="Invalid number">
          <TextField
            type="number"
            size="small"
            placeholder="10"
            label="Cost of Capital [%]"
            value={
              analysisData.wacc ? analysisData.wacc * 100 : analysisData.wacc
            }
            onChange={(e) => {
              handleChange(e, changeWacc, "wacc");
            }}
          />
        </Tooltip>
        <Tooltip
          placement="right-start"
          arrow
          open={errorG}
          title="Invalid number">
          <TextField
            type="number"
            size="small"
            placeholder="2"
            label="Terminal Growth Rate [%]"
            value={
              analysisData.terminalGrowthRate
                ? analysisData.terminalGrowthRate * 100
                : analysisData.terminalGrowthRate
            }
            onChange={(e) => {
              handleChange(e, changeTerminalGrowthRate, "g");
            }}
          />
        </Tooltip>
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
