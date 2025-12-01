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
      style={{ marginBottom: "0px", marginTop: "20px" }}>
      <ToggleButton
        className="custom-toggle-button"
        size="small"
        value="1000000">
        Millions
      </ToggleButton>
      <ToggleButton className="custom-toggle-button" size="small" value="1000">
        Thousands
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleButtonsScaling;
