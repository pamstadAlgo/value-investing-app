import React, { useState } from "react";
import {
  TextField,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  changeNrShares,
  changeTaxRate,
  changeTerminalGrowthRate,
  changeWacc,
} from "../../../features/analysisSlice";
import { NumericFormat } from "react-number-format";
import Tooltip from "@mui/material/Tooltip";

const SCALE_PERC = 100;

function ValuationAssumptions({ scalingFactor }) {
  const analysisData = useSelector((state) => state.analysis);
  const [errorTax, setErrorTax] = useState(false);
  const [errorWacc, setErrorWacc] = useState(false);
  const [errorG, setErrorG] = useState(false);
  const [errorNrShares, setErrorNrShares] = useState(false);

  const dispatch = useDispatch();
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
          <NumericFormat
            id="taxrate-input"
            value={analysisData.taxRate * SCALE_PERC}
            decimalScale={1} // 1 decimal place
            decimalSeparator="." // use dot for decimal
            customInput={TextField}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  className="custom-input-adornment"
                  style={{ color: "var(--border-input-fields)" }}
                  position="end">
                  %
                </InputAdornment>
              ),
            }}
            label="Tax Rate"
            size="small"
            placeholder="25"
            onValueChange={(values) => {
              const { floatValue } = values;
              if (floatValue != null) {
                setErrorTax(false);
                dispatch(changeTaxRate(floatValue / SCALE_PERC));
              } else {
                setErrorTax(true);
                dispatch(changeTaxRate(null));
              }
            }}
          />
        </Tooltip>
        <Tooltip
          placement="right-start"
          arrow
          open={errorWacc}
          title="Invalid number">
          <NumericFormat
            id="wacc-input"
            value={analysisData.wacc * SCALE_PERC}
            decimalScale={1} // 1 decimal place
            decimalSeparator="." // use dot for decimal
            customInput={TextField}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  className="custom-input-adornment"
                  style={{ color: "var(--border-input-fields)" }}
                  position="end">
                  %
                </InputAdornment>
              ),
            }}
            label="Cost of Capital (WACC)"
            size="small"
            placeholder="10"
            onValueChange={(values) => {
              const { floatValue } = values;
              if (floatValue != null) {
                setErrorWacc(false);
                dispatch(changeWacc(floatValue / SCALE_PERC));
              } else {
                setErrorWacc(true);
                dispatch(changeWacc(null));
              }
            }}
          />
        </Tooltip>
        <Tooltip
          placement="right-start"
          arrow
          open={errorG}
          title="Invalid number">
          <NumericFormat
            id="wacc-input"
            value={analysisData.terminalGrowthRate * SCALE_PERC}
            decimalScale={1} // 1 decimal place
            decimalSeparator="." // use dot for decimal
            customInput={TextField}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  className="custom-input-adornment"
                  style={{ color: "var(--border-input-fields)" }}
                  position="end">
                  %
                </InputAdornment>
              ),
            }}
            label="Cost of Capital (WACC)"
            size="small"
            placeholder="10"
            onValueChange={(values) => {
              const { floatValue } = values;
              if (floatValue != null) {
                setErrorG(false);
                dispatch(changeTerminalGrowthRate(floatValue / SCALE_PERC));
              } else {
                setErrorG(true);
                dispatch(changeTerminalGrowthRate(null));
              }
            }}
          />
        </Tooltip>

        <Tooltip
          placement="right-start"
          arrow
          open={errorG}
          title="Invalid number">
          <NumericFormat
            id="wacc-input"
            value={analysisData.terminalGrowthRate * SCALE_PERC}
            decimalScale={1} // 1 decimal place
            decimalSeparator="." // use dot for decimal
            customInput={TextField}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  className="custom-input-adornment"
                  style={{ color: "var(--border-input-fields)" }}
                  position="end">
                  %
                </InputAdornment>
              ),
            }}
            label="Cost of Capital (WACC)"
            size="small"
            placeholder="10"
            onValueChange={(values) => {
              const { floatValue } = values;
              if (floatValue != null) {
                setErrorG(false);
                dispatch(changeTerminalGrowthRate(floatValue / SCALE_PERC));
              } else {
                setErrorG(true);
                dispatch(changeTerminalGrowthRate(null));
              }
            }}
          />
        </Tooltip>

        <Tooltip
          placement="right-start"
          arrow
          open={errorNrShares}
          title="Invalid number">
          <NumericFormat
            id="wacc-input"
            value={analysisData?.companyData.nrShares / scalingFactor}
            decimalScale={1} // 1 decimal place
            thousandSeparator=","
            decimalSeparator="." // use dot for decimal
            customInput={TextField}
          
            label={`Nr of Shares (${
              scalingFactor === "1000000" ? "Millions" : "Thousands"
            })`}
            size="small"
            placeholder="10"
            onValueChange={(values) => {
              const { floatValue } = values;
              if (floatValue != null) {
                setErrorNrShares(false);
                dispatch(changeNrShares(floatValue * scalingFactor));
              } else {
                setErrorNrShares(true);
                dispatch(changeNrShares(null));
              }
            }}
          />
        </Tooltip>

        {/* <TextField
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
        /> */}
      </div>
    </div>
  );
}

export default ValuationAssumptions;
