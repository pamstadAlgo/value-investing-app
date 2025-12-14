import { useState } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

const OneDecimalNumberInput = () => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const next = e.target.value;

    // Allow clearing
    if (next === "") {
      setValue("");
      return;
    }

    // Browser already enforces numeric input for type="number"
    if (!Number.isNaN(Number(next))) {
      setValue(next);
    }
  };

  const handleBlur = () => {
    if (value === "") return;

    const num = Number(value);
    if (!Number.isNaN(num)) {
      setValue(num.toFixed(1));
    }
  };

  return (
    <OutlinedInput
      type="number"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0.0"
      inputProps={{
        step: 0.1,
        inputMode: "decimal",
      }}
      endAdornment={<InputAdornment position="end">%</InputAdornment>}
    />
  );
};

export default OneDecimalNumberInput;
