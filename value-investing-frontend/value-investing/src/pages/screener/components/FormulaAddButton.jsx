import React from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

function FormulaAddButton({ label, handleButtonClick }) {
  return (
    <div
      className="custom-button"
      onClick={(e) => {
        console.log("we click button");
        const label = e.currentTarget.querySelector("label"); // Find the label within the div
        handleButtonClick(label?.textContent);
      }}>
      <Fab
        className="custom-fab-element"
        size="small"
        color="primary"
        aria-label="add"
      >
        <AddIcon />
      </Fab>
      <label className="label-custom-button">{label}</label>
    </div>
  );
}

export default FormulaAddButton;
