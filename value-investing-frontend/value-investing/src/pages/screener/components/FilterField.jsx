import React, { useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch } from "react-redux";
import {
  addActiveFilter,
  remvActiveFilter,
} from "../../../features/stockScreenerSlice";

function FilterField({ label, field, checked }) {
  //   const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    //   check if checkbox is checked (e.target.checked = true) or unchecked (e.target.checked = false)
    if (e.target.checked) {
      dispatch(addActiveFilter(field));
    } else {
      //remove quantity from array
      dispatch(remvActiveFilter(field));
    }
  };
  
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleCheckboxChange} />}
      label={label}
    />
  );
}

export default FilterField;
