import React from "react";
import { Box, Stack, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import ToggleButtonsScaling from "./ToggleButtonsScaling";

const ValuationActionToolbar = ({
  scaling,
  onScalingChange,
  onSave,
  onToggleHistory,
  isHistoryOpen,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        mb: 1,
      }}
    >
      <div className="button-group-wrapper" style={{ margin: 0 }}>
        <ToggleButtonsScaling value={scaling} handleChange={onScalingChange} />
      </div>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={onSave}
          sx={{
            fontFamily: "var(--font-family)",
            fontWeight: 600,
            color: "var(--action-color)",
            borderColor: "var(--action-color)",
            "&:hover": {
              borderColor: "var(--header-color)",
              color: "var(--header-color)",
            },
          }}
        >
          Save Analysis
        </Button>

        <Button
          variant={isHistoryOpen ? "contained" : "outlined"}
          startIcon={<HistoryIcon />}
          onClick={onToggleHistory}
          sx={{
            fontFamily: "var(--font-family)",
            fontWeight: 600,
            color: isHistoryOpen ? "black" : "var(--text-color-grey-scale)",
            bgcolor: isHistoryOpen ? "var(--action-color)" : "transparent",
            borderColor: "var(--border-input-fields)",
            "&:hover": {
              bgcolor: isHistoryOpen
                ? "var(--action-color)"
                : "var(--input-fields-hover-bg-color)",
              borderColor: "var(--header-color)",
            },
          }}
        >
          History
        </Button>
      </Stack>
    </Box>
  );
};

export default ValuationActionToolbar;