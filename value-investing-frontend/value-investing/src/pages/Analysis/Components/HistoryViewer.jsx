import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchValuationHistory, clearHistory } from '../../../features/watchlistSlice';
import { 
  Box, Typography, List, ListItem, ListItemButton, ListItemText, 
  Divider, Chip, CircularProgress 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';

// Import actions to restore state
import { 
  initializeValuationData, 
  setValuationApproach,
  changeTaxRate,
  changeWacc,
  changeTerminalGrowthRate
} from '../../../features/analysisSlice';

const HistoryViewer = ({ qfsSymbol, watchlistId, onClose }) => {
  const dispatch = useDispatch();
  const { history, historyStatus } = useSelector((state) => state.watchlist);

  useEffect(() => {
    if (watchlistId && qfsSymbol) {
      // Clear previous history so we don't show wrong data while loading
      dispatch(clearHistory());
      dispatch(fetchValuationHistory({ watchlistId, ticker: qfsSymbol }));
    }
  }, [watchlistId, qfsSymbol, dispatch]);

  const loadHistoricalData = (valuation) => {
    const inputs = valuation.valuation_inputs;
    
    if (inputs && inputs.valuationData) {
      // 1. Restore the Valuation Model Grid
      dispatch(initializeValuationData(inputs.valuationData));
      
      // 2. Restore Assumptions if they exist
      if (inputs.valuationApproach) dispatch(setValuationApproach(inputs.valuationApproach));
      if (inputs.taxRate) dispatch(changeTaxRate(inputs.taxRate));
      if (inputs.wacc) dispatch(changeWacc(inputs.wacc));
      if (inputs.terminalGrowthRate) dispatch(changeTerminalGrowthRate(inputs.terminalGrowthRate));

      alert(`Restored valuation from ${new Date(valuation.created_at).toLocaleDateString()}. \n\nNote: This is a snapshot. Editing it will affect your local view, but won't change the historical record unless you save again.`);
      
      if (onClose) onClose();
    } else {
      alert("This historical entry does not contain full valuation data.");
    }
  };

  return (
    <Box sx={{ width: 320, p: 2, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      <Typography variant="h6" sx={{ fontFamily: 'var(--font-family)', mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--header-color)' }}>
        <HistoryIcon sx={{ color: 'var(--action-color)' }} /> Valuation History
      </Typography>
      
      <Divider sx={{ mb: 1, borderColor: 'var(--border-input-fields)' }} />

      {historyStatus === 'loading' ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
           <CircularProgress size={30} sx={{ color: 'var(--action-color)' }} />
         </Box>
      ) : (
        <List sx={{ flex: 1, overflowY: 'auto' }}>
            {history && history.length > 0 ? (
                history.map((val) => (
                <ListItem key={val.id} disablePadding sx={{ mb: 1, border: '1px solid var(--border-input-fields)', borderRadius: '4px' }}>
                    <ListItemButton 
                        onClick={() => loadHistoricalData(val)}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-family)', fontWeight: 'bold', color: 'var(--action-color)' }}>
                            Target: {val.price_target ? val.price_target.toFixed(2) : 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'gray' }}>
                            {new Date(val.created_at).toLocaleDateString()}
                        </Typography>
                    </Box>
                    
                    {val.notes && (
                        <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-color-grey-scale)', fontSize: '0.85rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{val.notes}"
                        </Typography>
                    )}
                    
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                         <Chip label="Load Snapshot" size="small" icon={<RestoreIcon />} sx={{ cursor: 'pointer', fontFamily: 'var(--font-family)' }} />
                    </Box>
                    </ListItemButton>
                </ListItem>
                ))
            ) : (
                <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center', mt: 4, fontStyle: 'italic' }}>
                    No historical valuations found.
                </Typography>
            )}
        </List>
      )}
    </Box>
  );
};

export default HistoryViewer;