import React, { useState } from "react";
import CustomMetricsModal from "./CustomMetricsModal";
import Button from "@mui/material/Button";
import AddchartOutlinedIcon from "@mui/icons-material/AddchartOutlined";
function CustomMetrics() {
  const [isCustomMetricsModalOpen, setIsCustomMetricsModalOpen] =
    useState(false);

  const handleCustomMetricsModalClose = () => {
    setIsCustomMetricsModalOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        className="contained-custom-button custom-metric"
        startIcon={<AddchartOutlinedIcon />}
        onClick={(e) => setIsCustomMetricsModalOpen(true)}>
        Create custom Filter
      </Button>
      <CustomMetricsModal
        isOpen={isCustomMetricsModalOpen}
        handleClose={handleCustomMetricsModalClose}
      />
    </div>
  );
}

export default CustomMetrics;
