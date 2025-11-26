import React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import { setValuationApproach } from "../../../features/analysisSlice";

function ValuationApproachSelect() {
  const valuationApproach = useSelector(
    (state) => state.analysis?.valuationApproach
  );

  const dispatch = useDispatch();

  const handleChange = (e) => {
    dispatch(setValuationApproach(e.target.value));
  };

  return (
    <FormControl
      size="small"
      fullwdith
      className="custom-form-control-val-approach">
      <InputLabel
        id="demo-simple-select-label"
        className="custom-label-val-model">
        Valuation Approach
      </InputLabel>
      <Select
        className="custom-select-val-model"
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={valuationApproach}
        label="Valuation Approach"
        onChange={handleChange}>
        <MenuItem value="topDown">Top-Down (Revenue & OpMargin)</MenuItem>
        <MenuItem value="bottomUp">
          Bottom-Up (Revenue, COGS, SG&A, R&D)
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default ValuationApproachSelect;
