import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

function ToggleButtonsValuation() {
  const [alignment, setAlignment] = React.useState("av");

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup
      className="custom-toggle-button-group"
      value={alignment}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      style={{ marginBottom: "6px" }}>
      <ToggleButton value="av">Asset Value</ToggleButton>
      <ToggleButton value="epv">EPV</ToggleButton>
      <ToggleButton value="penman">Penman</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleButtonsValuation;
