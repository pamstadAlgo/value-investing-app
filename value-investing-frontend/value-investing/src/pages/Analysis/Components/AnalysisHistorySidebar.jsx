import React from "react";
import { Collapse, Paper } from "@mui/material";
import HistoryViewer from "./HistoryViewer";
import Drawer from "@mui/material/Drawer";

const AnalysisHistorySidebar = ({ isOpen, qfsSymbol, onClose }) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="right"
      className="custom-drawer-val-history">
      <HistoryViewer qfsSymbol={qfsSymbol} onClose={onClose} />
    </Drawer>
  );
};

export default AnalysisHistorySidebar;
