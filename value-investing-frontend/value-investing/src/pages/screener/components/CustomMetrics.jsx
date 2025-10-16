import React, { useState } from "react";
import CustomMetricsModal from "./CustomMetricsModal";
import Button from "@mui/material/Button";
import AddchartOutlinedIcon from "@mui/icons-material/AddchartOutlined";
import FormulaEditorDrawer from "./FormulaEditorDrawer";
function CustomMetrics() {
  const [isCustomMetricsModalOpen, setIsCustomMetricsModalOpen] =
    useState(false);
  const [open, setOpen] = React.useState(false);

  const handleCustomMetricsModalClose = () => {
    setIsCustomMetricsModalOpen(false);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <Button
        variant="contained"
        className="contained-custom-button custom-metric"
        startIcon={<AddchartOutlinedIcon className="button-icon" />}
        // onClick={(e) => setIsCustomMetricsModalOpen(true)}>
        onClick={(e) => setOpen(true)}>
        {" "}
        Create custom Filter
      </Button>
      <FormulaEditorDrawer open={open} handleClose={handleCloseDrawer} />
      <CustomMetricsModal
        isOpen={isCustomMetricsModalOpen}
        handleClose={handleCustomMetricsModalClose}
      />
    </div>
  );
}

export default CustomMetrics;
