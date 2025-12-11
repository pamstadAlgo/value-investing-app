import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts';
import { 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Typography, 
    Button, 
    Paper,
    IconButton,
    TextField,
    Grid,
    Collapse,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt'; 
import TuneIcon from '@mui/icons-material/Tune'; 
import StarMenu from '../../GlobalComponents/StarMenu'; 
import { setHighlightedTicker } from '../../../features/stockScreenerSlice';
import { fetchWatchlists } from '../../../features/watchlistSlice'; 

// --- Constants ---
const COLOR_DEFAULT = '#4f46e5'; 
const COLOR_WATCHLIST = '#00e676'; 
const COLOR_SELECTED = '#ff9800'; 
const COLOR_DIMMED = '#333'; 

const FinancialScatterPlot = () => {
  const dispatch = useDispatch();
  
  // Redux
  const { queryResult, highlightedTicker } = useSelector((state) => state.stockscrenner);
  const { watchlists, status: watchlistStatus } = useSelector((state) => state.watchlist);

  // --- Configuration State ---
  const [xAxisKey, setXAxisKey] = useState('pe_ratio'); 
  const [yAxisKey, setYAxisKey] = useState('roic');     
  const [zAxisKey, setZAxisKey] = useState('market_cap');
  const [showAxisSettings, setShowAxisSettings] = useState(false);
  
  // --- Interaction State ---
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedWatchlistId, setFocusedWatchlistId] = useState(null);
  
  // --- Axis Domains ---
  const [xDomain, setXDomain] = useState([0, 100]);
  const [yDomain, setYDomain] = useState([0, 100]);

  // Flag to prevent background click from overriding bubble click
  const isNodeClicked = useRef(false);

  // --- Initial Load ---
  useEffect(() => {
    if (watchlistStatus === 'idle') {
      dispatch(fetchWatchlists());
    }
  }, [watchlistStatus, dispatch]);

  // --- Data Helpers ---
  const numericOptions = useMemo(() => {
    if (!queryResult || queryResult.length === 0) return [];
    const firstItem = queryResult[0];
    return Object.keys(firstItem).filter(key => 
      typeof firstItem[key] === 'number' && !key.includes('_id') && key !== 'id'
    );
  }, [queryResult]);

  // 1. Map Raw Data
  const rawData = useMemo(() => {
    if (!queryResult) return [];
    return queryResult.map(item => ({
      ...item, 
      x: item[xAxisKey] || 0,
      y: item[yAxisKey] || 0,
      z: item[zAxisKey] || 100 
    }));
  }, [queryResult, xAxisKey, yAxisKey, zAxisKey]);

  // 2. Build Watchlist Map
  const watchlistMap = useMemo(() => {
    const map = new Map(); 
    watchlists.forEach(list => {
      list.items?.forEach(item => {
        const symbol = item.qfs_symbol || item.ticker;
        if (!map.has(symbol)) map.set(symbol, []);
        map.get(symbol).push(list.id);
      });
    });
    return map;
  }, [watchlists]);

  // 3. Sort Data (Selected/Watchlist on Top)
  // This changes whenever selection changes, BUT we won't use this for calculating extents anymore.
  const sortedChartData = useMemo(() => {
    return [...rawData].sort((a, b) => {
        const symbolA = a.qfs_symbol || a.qfs_symbol_id;
        const symbolB = b.qfs_symbol || b.qfs_symbol_id;

        const isSelectedA = (selectedNode?.data?.qfs_symbol_id === symbolA);
        const isSelectedB = (selectedNode?.data?.qfs_symbol_id === symbolB);
        if (isSelectedA) return 1;
        if (isSelectedB) return -1;

        if (focusedWatchlistId) {
            const inFocusA = watchlistMap.get(symbolA)?.includes(focusedWatchlistId);
            const inFocusB = watchlistMap.get(symbolB)?.includes(focusedWatchlistId);
            if (inFocusA && !inFocusB) return 1;
            if (!inFocusA && inFocusB) return -1;
        }

        const inAnyA = watchlistMap.has(symbolA);
        const inAnyB = watchlistMap.has(symbolB);
        if (inAnyA && !inAnyB) return 1;
        if (!inAnyA && inAnyB) return -1;

        return (b.z || 0) - (a.z || 0); 
    });
  }, [rawData, selectedNode, focusedWatchlistId, watchlistMap]);

  // --- Calculate Extents (STABLE) ---
  // CRITICAL FIX: Depend on 'rawData' (unsorted), NOT 'sortedChartData'. 
  // 'rawData' does NOT change when you select a node, so this calculation won't re-run 
  // and the useEffect below won't fire, preserving your manual axis inputs.
  const dataExtent = useMemo(() => {
    if (!rawData.length) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
    const xs = rawData.map(d => d.x);
    const ys = rawData.map(d => d.y);
    return {
        // Precise extent logic
        xMin: Math.min(...xs),
        xMax: Math.max(...xs),
        yMin: Math.min(...ys),
        yMax: Math.max(...ys),
    };
  }, [rawData]); 

  // Reset domains only when the underlying data (metrics) actually changes
  useEffect(() => {
      // Add a small buffer to the extent so points aren't cut off at the edge
      const xBuffer = (dataExtent.xMax - dataExtent.xMin) * 0.05 || 1;
      const yBuffer = (dataExtent.yMax - dataExtent.yMin) * 0.05 || 1;

      setXDomain([dataExtent.xMin - xBuffer, dataExtent.xMax + xBuffer]);
      setYDomain([dataExtent.yMin - yBuffer, dataExtent.yMax + yBuffer]);
  }, [dataExtent]);

  // --- Handlers ---
  const handleClosePopup = () => setSelectedNode(null);

  const handleManualAxisChange = (axis, bound, value) => {
      if (value === '' || value === '-') return; 
      const numVal = parseFloat(value);
      if (isNaN(numVal)) return;

      if (axis === 'x') {
          setXDomain(prev => bound === 'min' ? [numVal, prev[1]] : [prev[0], numVal]);
      } else {
          setYDomain(prev => bound === 'min' ? [numVal, prev[1]] : [prev[0], numVal]);
      }
  };

  const resetView = () => {
      setSelectedNode(null);
      setFocusedWatchlistId(null);
      
      const xBuffer = (dataExtent.xMax - dataExtent.xMin) * 0.05 || 1;
      const yBuffer = (dataExtent.yMax - dataExtent.yMin) * 0.05 || 1;
      setXDomain([dataExtent.xMin - xBuffer, dataExtent.xMax + xBuffer]);
      setYDomain([dataExtent.yMin - yBuffer, dataExtent.yMax + yBuffer]);
  };

  // --- CLICK Handlers ---
  const handleNodeClick = (node, index, event) => {
      isNodeClicked.current = true;
      if (node && node.payload) {
          setSelectedNode({ data: node.payload, cx: node.cx, cy: node.cy });
          dispatch(setHighlightedTicker(node.payload.qfs_symbol_id));
      }
      if (event && event.stopPropagation) event.stopPropagation();
  };

  const handleChartClick = (e) => {
      if (isNodeClicked.current) {
          isNodeClicked.current = false;
          return;
      }
      setSelectedNode(null);
  };

  // --- Renderers ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && !selectedNode) {
      const data = payload[0].payload;
      const name = data.company || data.name || data.qfs_symbol;
      return (
        <Paper sx={{ p: 1.5, backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid #444', zIndex: 10 }}>
          <Typography variant="subtitle2" sx={{ color: COLOR_SELECTED, fontWeight: 'bold' }}>{name}</Typography>
          <Typography variant="caption" sx={{ color: '#ccc' }}>
             {xAxisKey}: {data.x?.toFixed(2)}, {yAxisKey}: {data.y?.toFixed(2)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const inputSx = { 
      '& .MuiInputBase-root': { color: '#ccc', fontSize: '0.85rem' }, 
      '& .MuiInputLabel-root': { color: '#888', fontSize: '0.85rem' },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
  };

  return (
    <Box className="glass-card" sx={{ p: 2, mb: 3, userSelect: 'none', position: 'relative' }}>
      
      {/* 1. Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ color: 'var(--header-color)', mr: 'auto', display: {xs: 'none', md: 'block'} }}>
          Financial Scatter Plot
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>X-Axis</InputLabel>
          <Select value={xAxisKey} label="X-Axis" onChange={(e) => setXAxisKey(e.target.value)}>
            {numericOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Y-Axis</InputLabel>
          <Select value={yAxisKey} label="Y-Axis" onChange={(e) => setYAxisKey(e.target.value)}>
            {numericOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Size (Z)</InputLabel>
          <Select value={zAxisKey} label="Size (Z)" onChange={(e) => setZAxisKey(e.target.value)}>
            {numericOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        
        <Button 
            startIcon={<TuneIcon />} 
            onClick={() => setShowAxisSettings(!showAxisSettings)} 
            variant={showAxisSettings ? "contained" : "outlined"} 
            size="small" 
            sx={{ height: '40px', minWidth: '40px' }}
        >
             <span style={{display: 'none'}}>Axes</span>
        </Button>
        
        <Button startIcon={<RestartAltIcon />} onClick={resetView} variant="outlined" size="small" sx={{ height: '40px' }}>
          Reset
        </Button>
      </Box>

      {/* 1b. Axis Settings Panel */}
      <Collapse in={showAxisSettings}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, border: '1px dashed #444' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{color: 'var(--header-color)', fontWeight: 'bold', mb: 1, display: 'block'}}>
                        X-Axis Range ({xAxisKey})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField 
                            label="Min" size="small" type="number" fullWidth sx={inputSx}
                            inputProps={{ step: "any" }} 
                            value={xDomain[0]} 
                            onChange={(e) => handleManualAxisChange('x', 'min', e.target.value)}
                        />
                        <TextField 
                            label="Max" size="small" type="number" fullWidth sx={inputSx}
                            inputProps={{ step: "any" }} 
                            value={xDomain[1]} 
                            onChange={(e) => handleManualAxisChange('x', 'max', e.target.value)}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                     <Typography variant="caption" sx={{color: 'var(--header-color)', fontWeight: 'bold', mb: 1, display: 'block'}}>
                        Y-Axis Range ({yAxisKey})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField 
                            label="Min" size="small" type="number" fullWidth sx={inputSx}
                            inputProps={{ step: "any" }} 
                            value={yDomain[0]} 
                            onChange={(e) => handleManualAxisChange('y', 'min', e.target.value)}
                        />
                        <TextField 
                            label="Max" size="small" type="number" fullWidth sx={inputSx}
                            inputProps={{ step: "any" }} 
                            value={yDomain[1]} 
                            onChange={(e) => handleManualAxisChange('y', 'max', e.target.value)}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
      </Collapse>

      {/* 2. Chart Area */}
      <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            onClick={handleChartClick}
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            
            <XAxis 
                type="number" dataKey="x" name={xAxisKey} 
                domain={xDomain} 
                stroke="#888" allowDataOverflow
                tickFormatter={(val) => Math.abs(val) >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(1)}
            />
            <YAxis 
                type="number" dataKey="y" name={yAxisKey} 
                domain={yDomain} 
                stroke="#888" allowDataOverflow
                tickFormatter={(val) => Math.abs(val) >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(1)}
            />
            <ZAxis type="number" dataKey="z" range={[60, 900]} name={zAxisKey} />
            
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#555' }} wrapperStyle={{ pointerEvents: 'none' }} />
            
            <Scatter 
                name="Companies" 
                data={sortedChartData} 
                onClick={handleNodeClick} // Handles bubble clicks
                style={{ cursor: 'pointer' }}
            >
            {sortedChartData.map((entry, index) => {
                const symbol = entry.qfs_symbol || entry.qfs_symbol_id;
                const isSelected = selectedNode?.data?.qfs_symbol_id === symbol;
                const isHighlighted = highlightedTicker === symbol;
                
                const listsContaining = watchlistMap.get(symbol);
                const isInAnyList = listsContaining && listsContaining.length > 0;
                const isInFocusedList = focusedWatchlistId && listsContaining?.includes(focusedWatchlistId);

                let fillColor = COLOR_DEFAULT; 
                let strokeColor = 'none';
                let opacity = 0.8;

                if (isSelected || isHighlighted) {
                    fillColor = COLOR_SELECTED;
                    strokeColor = '#fff';
                    opacity = 1;
                } else if (focusedWatchlistId) {
                    if (isInFocusedList) {
                        fillColor = COLOR_WATCHLIST;
                        opacity = 1;
                    } else {
                        fillColor = COLOR_DIMMED;
                        opacity = 0.3;
                    }
                } else if (isInAnyList) {
                    fillColor = COLOR_WATCHLIST;
                    opacity = 0.9;
                }

                return (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={fillColor} 
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 2 : 0}
                        fillOpacity={opacity}
                    />
                );
            })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* 3. Popup Card */}
        {selectedNode && (
            <Paper 
                className="glass-card"
                sx={{
                    position: 'absolute',
                    left: Math.min(selectedNode.cx + 20, 800), 
                    top: Math.max(selectedNode.cy - 50, 0),    
                    zIndex: 20,
                    p: 2,
                    minWidth: 220,
                    maxWidth: 300,
                    backgroundColor: 'var(--background-glass-card, #1e1e1e) !important', 
                    color: 'var(--text-color, #e0e0e0)',
                    border: '1px solid var(--border-input-fields, #333)',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'var(--header-color, #ff9800)', fontWeight: 'bold', lineHeight: 1.2 }}>
                        {selectedNode.data.company || selectedNode.data.name}
                    </Typography>
                    <IconButton size="small" onClick={handleClosePopup} sx={{ mt: -1, mr: -1, color: '#aaa' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {selectedNode.data.qfs_symbol}
                    </Typography>
                    <StarMenu ticker={selectedNode.data.qfs_symbol_id} />
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: 1 }}>
                    <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
                        <span style={{color:'#888'}}>{xAxisKey}:</span> <b>{selectedNode.data.x?.toFixed(2)}</b>
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
                        <span style={{color:'#888'}}>{yAxisKey}:</span> <b>{selectedNode.data.y?.toFixed(2)}</b>
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
                        <span style={{color:'#888'}}>Size:</span> <b>{typeof selectedNode.data.z === 'number' ? selectedNode.data.z.toLocaleString() : selectedNode.data.z}</b>
                    </Typography>
                </Box>
            </Paper>
        )}
      </Box>

      {/* 4. Watchlist Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
          <Chip 
            label="All Companies" 
            variant={focusedWatchlistId === null ? "filled" : "outlined"}
            onClick={() => setFocusedWatchlistId(null)}
            sx={{ 
                color: focusedWatchlistId === null ? '#fff' : '#888',
                bgcolor: focusedWatchlistId === null ? COLOR_DEFAULT : 'transparent',
                borderColor: '#444'
            }}
          />
          {watchlists.map(list => (
              <Chip
                key={list.id}
                label={list.title}
                variant={focusedWatchlistId === list.id ? "filled" : "outlined"}
                onClick={() => setFocusedWatchlistId(focusedWatchlistId === list.id ? null : list.id)}
                icon={<div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLOR_WATCHLIST }} />}
                sx={{
                    color: focusedWatchlistId === list.id ? '#000' : '#ccc',
                    bgcolor: focusedWatchlistId === list.id ? COLOR_WATCHLIST : 'transparent',
                    borderColor: focusedWatchlistId === list.id ? COLOR_WATCHLIST : '#444',
                    fontWeight: focusedWatchlistId === list.id ? 'bold' : 'normal'
                }}
              />
          ))}
      </Box>
    </Box>
  );
};

export default FinancialScatterPlot;