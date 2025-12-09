import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { saveValuationToWatchlist, fetchWatchlists } from "../../../features/watchlistSlice";

const SaveValuationModal = ({ open, onClose, qfsSymbol, equityVals }) => {
  const dispatch = useDispatch();
  
  // 1. Grab the full analysis state
  const analysisState = useSelector((state) => state.analysis);
  const { watchlists, status } = useSelector((state) => state.watchlist);
  
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedCase, setSelectedCase] = useState(1);
  const [customTarget, setCustomTarget] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && status === 'idle') {
      dispatch(fetchWatchlists());
    }
  }, [open, status, dispatch]);

  useEffect(() => {
    if (watchlists.length > 0 && !selectedListId) {
      setSelectedListId(watchlists[0].id);
    }
  }, [watchlists, selectedListId]);

  useEffect(() => {
    if (equityVals && equityVals.length === 3) {
       const val = equityVals[selectedCase];
       if (val) setCustomTarget(val.toFixed(2));
    }
  }, [selectedCase, equityVals]);

  const handleSave = () => {
    if (!selectedListId) return alert("Please select a watchlist");

    // 2. Construct the snapshot object from Redux state
    const valuationInputsSnapshot = {
        valuationData: analysisState.valuationData,
        valuationApproach: analysisState.valuationApproach,
        taxRate: analysisState.taxRate,
        wacc: analysisState.wacc,
        terminalGrowthRate: analysisState.terminalGrowthRate,
        // We can add other fields if needed, like balanceSheet modifications
    };
    
    dispatch(saveValuationToWatchlist({
      watchlistId: selectedListId,
      ticker: qfsSymbol,
      price_target: parseFloat(customTarget),
      notes: notes,
      valuation_date: new Date().toISOString().split('T')[0],
      valuation_inputs: valuationInputsSnapshot // <-- Send it!
    }))
    .unwrap()
    .then(() => {
      alert("Valuation and inputs saved!");
      onClose();
    })
    .catch((err) => alert(`Error: ${err.message}`));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
        SAVE VALUATION: <span style={{color: 'var(--action-color)'}}>{qfsSymbol}</span>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <FormControl fullWidth variant="standard">
            <InputLabel>Select Watchlist</InputLabel>
            <Select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              {watchlists.map((list) => (
                <MenuItem key={list.id} value={list.id}>{list.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
             <FormControl fullWidth variant="standard">
              <InputLabel>Valuation Case</InputLabel>
              <Select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
              >
                <MenuItem value={0}>Bear {equityVals?.[0] ? `(${equityVals[0].toFixed(2)})` : ''}</MenuItem>
                <MenuItem value={1}>Base {equityVals?.[1] ? `(${equityVals[1].toFixed(2)})` : ''}</MenuItem>
                <MenuItem value={2}>Bull {equityVals?.[2] ? `(${equityVals[2].toFixed(2)})` : ''}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Price Target"
              type="number"
              variant="standard"
              fullWidth
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
            />
          </Box>

          <TextField
            label="Underwriting Assumptions / Notes"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'gray' }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: 'var(--action-color)', fontWeight: 'bold' }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveValuationModal;