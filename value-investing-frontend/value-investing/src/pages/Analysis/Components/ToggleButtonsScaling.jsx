import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

function ToggleButtonsScaling({ value, handleChange }) {
  return (
    <ToggleButtonGroup
      className="custom-toggle-button-group"
      value={value}
      exclusive
      onChange={(e, newValue) => handleChange(e, newValue)}
      aria-label="Platform"
      style={{ marginBottom: "6px" }}>
      <ToggleButton value="1000000">Millions</ToggleButton>
      <ToggleButton value="1000">Thousands</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleButtonsScaling;
