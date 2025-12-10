import React from "react";
import { Collapse, Paper } from "@mui/material";
import HistoryViewer from "./HistoryViewer";

const AnalysisHistorySidebar = ({ isOpen, qfsSymbol, onClose }) => {
  return (
    <Collapse orientation="horizontal" in={isOpen}>
      <Paper
        elevation={3}
        sx={{
          width: 340,
          height: "calc(100vh - 150px)",
          position: "sticky",
          top: 20,
          bgcolor: "var(--background-glass-card)",
          border: "1px solid var(--border-input-fields)",
          borderRadius: "12px",
          overflow: "hidden",
          mt: 4, // Align visually with tabs
          ml: 2, // Add some spacing from the main content
        }}
      >
        <HistoryViewer qfsSymbol={qfsSymbol} onClose={onClose} />
      </Paper>
    </Collapse>
  );
};

export default AnalysisHistorySidebar;