import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Import from new slice
import {
  fetchValuationHistory,
  clearHistory,
} from "../../../features/valuationHistorySlice";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import RestoreIcon from "@mui/icons-material/Restore";
import PersonIcon from "@mui/icons-material/Person";

import {
  initializeValuationData,
  setValuationApproach,
  changeTaxRate,
  changeWacc,
  changeTerminalGrowthRate,
} from "../../../features/analysisSlice";

const HistoryViewer = ({ qfsSymbol, onClose }) => {
  const dispatch = useDispatch();
  // Select from new slice
  const { history, status } = useSelector((state) => state.valuationHistory);

  // useEffect(() => {
  //   if (qfsSymbol) {
  //     dispatch(clearHistory());
  //     dispatch(fetchValuationHistory({ ticker: qfsSymbol }));
  //   }
  // }, [qfsSymbol, dispatch]);

  const loadHistoricalData = (valuation) => {
    const inputs = valuation.model_inputs;

    if (inputs && inputs.valuationData) {
      if (
        window.confirm(
          `Load snapshot from ${new Date(
            valuation.created_at
          ).toLocaleDateString()}?\n\nThis will overwrite your current work.`
        )
      ) {
        dispatch(initializeValuationData(inputs.valuationData));

        if (inputs.valuationApproach)
          dispatch(setValuationApproach(inputs.valuationApproach));
        if (inputs.taxRate) dispatch(changeTaxRate(inputs.taxRate));
        if (inputs.wacc) dispatch(changeWacc(inputs.wacc));
        if (inputs.terminalGrowthRate)
          dispatch(changeTerminalGrowthRate(inputs.terminalGrowthRate));

        if (onClose) onClose();
      }
    } else {
      alert("This historical entry does not contain full valuation data.");
    }
  };

  return (
    <Box
      sx={{
        width: 320,
        p: 2,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "var(--font-family)",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "var(--header-color)",
        }}>
        <HistoryIcon sx={{ color: "var(--action-color)" }} /> Valuation History
      </Typography>

      <Divider sx={{ mb: 1, borderColor: "var(--border-input-fields)" }} />

      {status === "loading" ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size={30} sx={{ color: "var(--action-color)" }} />
        </Box>
      ) : (
        <List sx={{ flex: 1, overflowY: "auto" }}>
          {history && history.length > 0 ? (
            history.map((val) => (
              <ListItem
                key={val.id}
                disablePadding
                sx={{
                  mb: 1,
                  border: "1px solid var(--border-input-fields)",
                  borderRadius: "4px",
                  bgcolor: "var(--background-glass-card)",
                }}>
                <ListItemButton
                  onClick={() => loadHistoricalData(val)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    p: 1.5,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      mb: 0.5,
                      alignItems: "center",
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: "var(--font-family)",
                        fontWeight: "bold",
                        color: "var(--action-color)",
                        fontSize: "1rem",
                      }}>
                      {val.price_target ? val.price_target.toFixed(2) : "N/A"}
                    </Typography>
                    <Chip
                      label={val.tags || "Snapshot"}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "0.65rem",
                        bgcolor: "var(--action-color-more-transparent)",
                        color: "var(--action-color)",
                        fontFamily: "var(--font-family)",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      mb: 1,
                    }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "gray",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}>
                      <PersonIcon sx={{ fontSize: 14 }} />{" "}
                      {val.analyst_name || val.username || "Me"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "gray" }}>
                      {new Date(val.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {val.thesis && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "var(--font-family)",
                        color: "var(--text-color-grey-scale)",
                        fontSize: "0.8rem",
                        fontStyle: "italic",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 1,
                      }}>
                      "{val.thesis}"
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-end",
                    }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "var(--action-color)",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}>
                      <RestoreIcon sx={{ fontSize: 16, mr: 0.5 }} /> RESTORE
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "gray",
                textAlign: "center",
                mt: 4,
                fontStyle: "italic",
              }}>
              No history yet. Save a valuation to see it here.
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default HistoryViewer;
