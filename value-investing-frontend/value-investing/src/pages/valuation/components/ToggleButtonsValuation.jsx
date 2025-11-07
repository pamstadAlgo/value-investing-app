import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

function ToggleButtonsValuation({ handleChange, value }) {
  // const [alignment, setAlignment] = React.useState("av");

  // const handleChange = (event, newAlignment) => {
  //   setAlignment(newAlignment);
  //   console.log("new value toogle button: ", newAlignment);
  // };

  return (
    <ToggleButtonGroup
      className="custom-toggle-button-group"
      value={value}
      exclusive
      onChange={(e, newValue) => handleChange(e, newValue)}
      aria-label="Platform"
      style={{ marginBottom: "6px" }}>
      <ToggleButton value="av">Asset Value</ToggleButton>
      <ToggleButton value="epv">EPV</ToggleButton>
      <ToggleButton value="penman">Penman</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleButtonsValuation;
