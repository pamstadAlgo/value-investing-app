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
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
// Import from BOTH slices now
import { addStockToWatchlist, fetchWatchlists } from "../../../features/watchlistSlice";
import { saveValuationSnapshot } from "../../../features/valuationHistorySlice";

const SaveValuationModal = ({ open, onClose, qfsSymbol, equityVals }) => {
  const dispatch = useDispatch();
  
  // Selectors
  const analysisState = useSelector((state) => state.analysis);
  const { watchlists, status } = useSelector((state) => state.watchlist);
  const { saveStatus } = useSelector((state) => state.valuationHistory);
  
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedCase, setSelectedCase] = useState(1);
  const [customTarget, setCustomTarget] = useState("");
  const [thesis, setThesis] = useState("");
  const [tag, setTag] = useState("Base Case");

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

  const handleSave = async () => {
    if (!customTarget) return alert("Please enter a price target");

    // 1. Construct the snapshot
    const valuationInputsSnapshot = {
        valuationData: analysisState.valuationData,
        valuationApproach: analysisState.valuationApproach,
        taxRate: analysisState.taxRate,
        wacc: analysisState.wacc,
        terminalGrowthRate: analysisState.terminalGrowthRate,
    };
    
    try {
        // 2. Save to History (The new slice)
        await dispatch(saveValuationSnapshot({
            qfs_symbol: qfsSymbol,
            price_target: parseFloat(customTarget),
            thesis: thesis,
            tags: tag,
            current_price_at_submission: analysisState.companyData?.price || 0,
            model_inputs: valuationInputsSnapshot
        })).unwrap();

        // 3. Optional: Add to Watchlist (The old slice)
        if (selectedListId) {
            dispatch(addStockToWatchlist({ watchlistId: selectedListId, ticker: qfsSymbol }));
        }

        alert("Valuation saved to history!");
        onClose();
        
    } catch (err) {
        alert(`Error saving valuation: ${JSON.stringify(err)}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
        SAVE ANALYSIS: <span style={{color: 'var(--action-color)'}}>{qfsSymbol}</span>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          
          <FormControl fullWidth variant="standard">
            <InputLabel>Add to Watchlist (Optional)</InputLabel>
            <Select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {watchlists.map((list) => (
                <MenuItem key={list.id} value={list.id}>{list.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
             <FormControl fullWidth variant="standard">
              <InputLabel>Select Case</InputLabel>
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
            label="Investment Thesis / Notes"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
          />
          
          <TextField
            label="Tag (e.g. Q3 Earnings)"
            variant="standard"
            fullWidth
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'gray' }}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saveStatus === 'loading'}
          sx={{ bgcolor: 'var(--action-color)', fontWeight: 'bold' }}
        >
          {saveStatus === 'loading' ? 'Saving...' : 'Save Snapshot'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveValuationModal;