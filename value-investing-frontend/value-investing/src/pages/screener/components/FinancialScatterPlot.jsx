import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import StarMenu from "../../GlobalComponents/StarMenu";
import { setHighlightedTicker } from "../../../features/stockScreenerSlice";
import { fetchWatchlists } from "../../../features/watchlistSlice";
import { initializeTickerSymbol } from "../../../features/analysisSlice";

// --- Constants ---
// Using CSS Variables where possible, or matching hexes for Recharts if needed logic strictly requires hex (though CSS vars work for fill)
const COLOR_DEFAULT = "var(--action-color)"; // Terminal Orange by default or whatever action color is
const COLOR_WATCHLIST = "var(--success-color)"; // Terminal Green
const COLOR_SELECTED = "var(--action-color)"; // Explicit Orange for selected to ensure visibility
const COLOR_DIMMED = "var(--action-color-transparent-less)";

const formatMillions = (value) => {
  if (typeof value !== "number") return value;
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  return value.toLocaleString();
};

const MemoizedScatterChart = React.memo(
  ({
    data,
    xAxisKey,
    yAxisKey,
    zAxisKey,
    xDomain,
    yDomain,
    handleChartClick,
    handleNodeClick,
    selectedNode,
    highlightedTicker,
    focusedWatchlistId,
    watchlistMap,
  }) => {

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length && !selectedNode) {
        const data = payload[0].payload;
        const name = data.company || data.name || data.qfs_symbol;
        return (
          <Paper
            sx={{
              p: 1.5,
              backgroundColor: "rgba(20, 20, 20, 0.95)",
              border: "1px solid #444",
              zIndex: 10,
            }}>
            <Typography
              variant="subtitle2"
              sx={{ color: COLOR_SELECTED, fontWeight: "bold" }}>
              {name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#ccc" }}>
              {xAxisKey}: {data.x?.toFixed(2)}, {yAxisKey}: {data.y?.toFixed(2)}
            </Typography>
          </Paper>
        );
      }
      return null;
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          onClick={handleChartClick}
          margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          <XAxis
            type="number"
            dataKey="x"
            name={xAxisKey}
            domain={xDomain}
            stroke="#888"
            allowDataOverflow
            tickFormatter={(val) =>
              Math.abs(val) >= 1000
                ? `${(val / 1000).toFixed(0)}k`
                : val.toFixed(1)
            }
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisKey}
            domain={yDomain}
            stroke="#888"
            allowDataOverflow
            tickFormatter={(val) =>
              Math.abs(val) >= 1000
                ? `${(val / 1000).toFixed(0)}k`
                : val.toFixed(1)
            }
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[60, 900]}
            name={zAxisKey}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3", stroke: "#555" }}
            wrapperStyle={{ pointerEvents: "none" }}
          />

          <Scatter
            name="Companies"
            data={data}
            isAnimationActive={false}
            onClick={handleNodeClick}
            style={{ cursor: "pointer" }}>
            {data.map((entry, index) => {
              const symbol = entry.qfs_symbol || entry.qfs_symbol_id;
              const isSelected = selectedNode?.data?.qfs_symbol_id === symbol;
              const isHighlighted = highlightedTicker === symbol;

              const listsContaining = watchlistMap.get(symbol);
              const isInAnyList = listsContaining && listsContaining.length > 0;
              const isInFocusedList =
                focusedWatchlistId &&
                listsContaining?.includes(focusedWatchlistId);

              // Default logic
              let fillColor = COLOR_DEFAULT;
              let strokeColor = "none";
              let opacity = 0.8;

              // Selection overrides everything
              if (isSelected || isHighlighted) {
                fillColor = COLOR_SELECTED;
                strokeColor = "#fff";
                opacity = 1;
              }
              // Focused list logic
              else if (focusedWatchlistId) {
                if (isInFocusedList) {
                  fillColor = COLOR_WATCHLIST;
                  opacity = 1;
                } else {
                  fillColor = COLOR_DIMMED;
                  opacity = 0.3;
                }
              }
              // Any list logic
              else if (isInAnyList) {
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
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance if needed, or rely on React.memo shallow compare if props are stable
    // Since we pass 'data' (sortedChartData) which is memoized in parent, and 'watchlistMap' (memoized), this should be fine.
    return (
      prevProps.data === nextProps.data &&
      prevProps.xAxisKey === nextProps.xAxisKey &&
      prevProps.yAxisKey === nextProps.yAxisKey &&
      prevProps.zAxisKey === nextProps.zAxisKey &&
      prevProps.xDomain === nextProps.xDomain &&
      prevProps.yDomain === nextProps.yDomain &&
      prevProps.selectedNode === nextProps.selectedNode &&
      prevProps.highlightedTicker === nextProps.highlightedTicker &&
      prevProps.focusedWatchlistId === nextProps.focusedWatchlistId
    );
  }
);

const FinancialScatterPlot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux
  const { queryResult, highlightedTicker } = useSelector(
    (state) => state.stockscrenner
  );
  const { watchlists } = useSelector(
    (state) => state.watchlist
  );

  // --- Configuration State ---
  const [xAxisKey, setXAxisKey] = useState("rnoa_ttm");
  const [yAxisKey, setYAxisKey] = useState("penman_g");
  const [zAxisKey, setZAxisKey] = useState("market_cap_q");
  const [showAxisSettings, setShowAxisSettings] = useState(false);

  // --- Interaction State ---
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedWatchlistId, setFocusedWatchlistId] = useState(null);

  // --- Axis Domains ---
  const [xDomain, setXDomain] = useState([0, 0.5]);
  const [yDomain, setYDomain] = useState([-0.5, 0.5]);

  // Local input state to allow free typing
  const [xMinInput, setXMinInput] = useState("0");
  const [xMaxInput, setXMaxInput] = useState("0.5");
  const [yMinInput, setYMinInput] = useState("-0.5");
  const [yMaxInput, setYMaxInput] = useState("0.5");

  // Flag to prevent background click from overriding bubble click
  const isNodeClicked = useRef(false);
  
  // Track previous axis keys to detect changes
  const prevAxisKeys = useRef({ x: xAxisKey, y: yAxisKey, z: zAxisKey });

  // --- Initial Load ---
  useEffect(() => {
    dispatch(fetchWatchlists());
  }, []);

  // --- Data Helpers ---
  const numericOptions = useMemo(() => {
    if (!queryResult || queryResult.length === 0) return [];
    const firstItem = queryResult[0];
    return Object.keys(firstItem).filter(
      (key) =>
        typeof firstItem[key] === "number" &&
        !key.includes("_id") &&
        key !== "id"
    );
  }, [queryResult]);

  // 1. Map Raw Data
  const rawData = useMemo(() => {
    if (!queryResult) return [];
    return queryResult.map((item) => ({
      ...item,
      x: item[xAxisKey] || 0,
      y: item[yAxisKey] || 0,
      z: item[zAxisKey] || 100,
    }));
  }, [queryResult, xAxisKey, yAxisKey, zAxisKey]);

  // 2. Build Watchlist Map
  const watchlistMap = useMemo(() => {
    const map = new Map();
    watchlists.forEach((list) => {
      list.items?.forEach((item) => {
        const symbol = item.qfs_symbol || item.ticker;
        if (!map.has(symbol)) map.set(symbol, []);
        map.get(symbol).push(list.id);
      });
    });
    return map;
  }, [watchlists]);

  // 3. Sort Data (Selected/Watchlist on Top)
  const sortedChartData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const symbolA = a.qfs_symbol || a.qfs_symbol_id;
      const symbolB = b.qfs_symbol || b.qfs_symbol_id;

      const isSelectedA = selectedNode?.data?.qfs_symbol_id === symbolA;
      const isSelectedB = selectedNode?.data?.qfs_symbol_id === symbolB;
      if (isSelectedA) return 1;
      if (isSelectedB) return -1;

      if (focusedWatchlistId) {
        const inFocusA = watchlistMap
          .get(symbolA)
          ?.includes(focusedWatchlistId);
        const inFocusB = watchlistMap
          .get(symbolB)
          ?.includes(focusedWatchlistId);
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
  const dataExtent = useMemo(() => {
    if (!rawData.length) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
    const xs = rawData.map((d) => d.x);
    const ys = rawData.map((d) => d.y);
    return {
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      yMin: Math.min(...ys),
      yMax: Math.max(...ys),
    };
  }, [rawData]);

  // Reset domains only when the underlying data (metrics) actually changes
  useEffect(() => {
    // Check if axis keys have changed
    const axisChanged = 
      prevAxisKeys.current.x !== xAxisKey ||
      prevAxisKeys.current.y !== yAxisKey ||
      prevAxisKeys.current.z !== zAxisKey;

    // Only auto-scale if axes have changed from previous value
    if (axisChanged) {
      const xBuffer = (dataExtent.xMax - dataExtent.xMin) * 0.05 || 1;
      const yBuffer = (dataExtent.yMax - dataExtent.yMin) * 0.05 || 1;

      const newXMin = dataExtent.xMin - xBuffer;
      const newXMax = dataExtent.xMax + xBuffer;
      const newYMin = dataExtent.yMin - yBuffer;
      const newYMax = dataExtent.yMax + yBuffer;

      setXDomain([newXMin, newXMax]);
      setYDomain([newYMin, newYMax]);

      // Sync inputs
      setXMinInput(newXMin.toString());
      setXMaxInput(newXMax.toString());
      setYMinInput(newYMin.toString());
      setYMaxInput(newYMax.toString());
      
      // Update previous axis keys
      prevAxisKeys.current = { x: xAxisKey, y: yAxisKey, z: zAxisKey };
    }
  }, [dataExtent, xAxisKey, yAxisKey, zAxisKey]);

  // --- Handlers ---
  const handleClosePopup = () => setSelectedNode(null);

  // Input Handlers
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const commitAxisChange = (axis, bound, valueStr, currentDomain) => {
    const val = parseFloat(valueStr);
    if (isNaN(val)) return; // Don't update if invalid

    if (axis === 'x') {
      if (bound === 'min') setXDomain([val, currentDomain[1]]);
      else setXDomain([currentDomain[0], val]);
    } else {
      if (bound === 'min') setYDomain([val, currentDomain[1]]);
      else setYDomain([currentDomain[0], val]);
    }
  }

  const handleBlur = (axis, bound) => {
    if (axis === 'x') {
      if (bound === 'min') commitAxisChange('x', 'min', xMinInput, xDomain);
      else commitAxisChange('x', 'max', xMaxInput, xDomain);
    } else {
      if (bound === 'min') commitAxisChange('y', 'min', yMinInput, yDomain);
      else commitAxisChange('y', 'max', yMaxInput, yDomain);
    }
  }

  const handleKeyDown = (e, axis, bound) => {
    if (e.key === 'Enter') {
      handleBlur(axis, bound);
    }
  }


  const resetView = () => {
    setSelectedNode(null);
    setFocusedWatchlistId(null);

    const xBuffer = (dataExtent.xMax - dataExtent.xMin) * 0.05 || 1;
    const yBuffer = (dataExtent.yMax - dataExtent.yMin) * 0.05 || 1;

    const newX = [dataExtent.xMin - xBuffer, dataExtent.xMax + xBuffer];
    const newY = [dataExtent.yMin - yBuffer, dataExtent.yMax + yBuffer];

    setXDomain(newX);
    setYDomain(newY);
    setXMinInput(newX[0].toString());
    setXMaxInput(newX[1].toString());
    setYMinInput(newY[0].toString());
    setYMaxInput(newY[1].toString());
  };

  // --- CLICK Handlers ---
  // Memoized handlers to ensure stable props for the chart
  const handleNodeClick = useCallback((node, index, event) => {
    isNodeClicked.current = true;
    if (node && node.payload) {
      setSelectedNode({ data: node.payload, cx: node.cx, cy: node.cy });
      dispatch(setHighlightedTicker(node.payload.qfs_symbol_id));
    }
    if (event && event.stopPropagation) event.stopPropagation();
  }, [dispatch]);

  const handleChartClick = useCallback((e) => {
    if (isNodeClicked.current) {
      isNodeClicked.current = false;
      return;
    }
    setSelectedNode(null);
  }, []);

  const handleNavigateToAnalysis = (targetTab) => {
    if (selectedNode) {
      const symbol = selectedNode.data.qfs_symbol || selectedNode.data.ticker;
      const normalizedTickerData = {
        ...selectedNode.data,
        qfs_symbol: symbol,
      };

      dispatch(initializeTickerSymbol(normalizedTickerData));
      navigate("/analysis", { state: { initialTab: targetTab } });
    }
  };

  const inputSx = {
    "& .MuiInputBase-root": {
      color: "var(--inner-text-input-fields)",
      fontSize: "0.85rem"
    },
    "& .MuiInputLabel-root": {
      color: "var(--label-color-input-fields)",
      fontSize: "0.85rem"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--border-input-fields)"
    },
  };

  // Button Styles
  const buttonStyleDefault = {
    height: "40px",
    minWidth: "40px", // added to ensure Tune button isn't tiny when outlined
    borderColor: "var(--border-input-fields)",
    color: "var(--text-color-grey-scale)",
    '&:hover': {
      borderColor: "var(--action-color)",
      color: "var(--header-color)",
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    }
  };

  const buttonStyleActive = {
    height: "40px",
    minWidth: "40px",
    backgroundColor: "var(--action-color)",
    color: "white",
    '&:hover': {
      backgroundColor: "var(--action-color-monaco-editor-hover)"
    }
  };


  return (
    <Box
      className="glass-card"
      sx={{ p: 2, mb: 3, userSelect: "none", position: "relative" }}>
      {/* 1. Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
        <Typography
          variant="h6"
          sx={{
            color: "var(--header-color)",
            mr: "auto",
            display: { xs: "none", md: "block" },
          }}>
          Financial Scatter Plot
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>X-Axis</InputLabel>
          <Select
            value={xAxisKey}
            label="X-Axis"
            onChange={(e) => setXAxisKey(e.target.value)}>
            {numericOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Y-Axis</InputLabel>
          <Select
            value={yAxisKey}
            label="Y-Axis"
            onChange={(e) => setYAxisKey(e.target.value)}>
            {numericOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Size (Z)</InputLabel>
          <Select
            value={zAxisKey}
            label="Size (Z)"
            onChange={(e) => setZAxisKey(e.target.value)}>
            {numericOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          startIcon={<TuneIcon />}
          onClick={() => setShowAxisSettings(!showAxisSettings)}
          variant={showAxisSettings ? "contained" : "outlined"}
          size="small"
          sx={showAxisSettings ? buttonStyleActive : buttonStyleDefault}>
          <span style={{ display: "none" }}>Axes</span>
        </Button>

        <Button
          startIcon={<RestartAltIcon />}
          onClick={resetView}
          variant="outlined"
          size="small"
          sx={buttonStyleDefault}>
          Reset
        </Button>
      </Box>

      {/* 1b. Axis Settings Panel */}
      <Collapse in={showAxisSettings}>
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "rgba(255,255,255,0.03)",
            borderRadius: 1,
            border: "1px dashed var(--border-input-fields)",
          }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="caption"
                sx={{
                  color: "var(--header-color)",
                  fontWeight: "bold",
                  mb: 1,
                  display: "block",
                }}>
                X-Axis Range ({xAxisKey})
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Min"
                  size="small"
                  fullWidth
                  sx={inputSx}
                  value={xMinInput}
                  onChange={handleInputChange(setXMinInput)}
                  onBlur={() => handleBlur('x', 'min')}
                  onKeyDown={(e) => handleKeyDown(e, 'x', 'min')}
                />
                <TextField
                  label="Max"
                  size="small"
                  fullWidth
                  sx={inputSx}
                  value={xMaxInput}
                  onChange={handleInputChange(setXMaxInput)}
                  onBlur={() => handleBlur('x', 'max')}
                  onKeyDown={(e) => handleKeyDown(e, 'x', 'max')}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="caption"
                sx={{
                  color: "var(--header-color)",
                  fontWeight: "bold",
                  mb: 1,
                  display: "block",
                }}>
                Y-Axis Range ({yAxisKey})
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Min"
                  size="small"
                  fullWidth
                  sx={inputSx}
                  value={yMinInput}
                  onChange={handleInputChange(setYMinInput)}
                  onBlur={() => handleBlur('y', 'min')}
                  onKeyDown={(e) => handleKeyDown(e, 'y', 'min')}
                />
                <TextField
                  label="Max"
                  size="small"
                  fullWidth
                  sx={inputSx}
                  value={yMaxInput}
                  onChange={handleInputChange(setYMaxInput)}
                  onBlur={() => handleBlur('y', 'max')}
                  onKeyDown={(e) => handleKeyDown(e, 'y', 'max')}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* 2. Chart Area */}
      <Box sx={{ height: 500, width: "100%", position: "relative" }}>
        <MemoizedScatterChart
          data={sortedChartData}
          xAxisKey={xAxisKey}
          yAxisKey={yAxisKey}
          zAxisKey={zAxisKey}
          xDomain={xDomain}
          yDomain={yDomain}
          handleChartClick={handleChartClick}
          handleNodeClick={handleNodeClick}
          selectedNode={selectedNode}
          highlightedTicker={highlightedTicker}
          focusedWatchlistId={focusedWatchlistId}
          watchlistMap={watchlistMap}
        />

        {/* 3. Popup Card */}
        {selectedNode && (
          <Paper
            className="glass-card"
            sx={{
              position: "absolute",
              left: Math.min(selectedNode.cx + 20, 800),
              top: Math.max(selectedNode.cy - 50, 0),
              zIndex: 20,
              p: 2,
              minWidth: 220,
              maxWidth: 300,
              backgroundColor: "var(--background-glass-card, #1e1e1e) !important",
              color: "var(--text-color, #e0e0e0)",
              border: "1px solid var(--border-input-fields, #333)",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.5)",
              animation: "fadeIn 0.2s ease-in-out",
            }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "var(--header-color, #ff9800)",
                  fontWeight: "bold",
                  lineHeight: 1.2,
                }}>
                {selectedNode.data.company || selectedNode.data.name}
              </Typography>
              <IconButton
                size="small"
                onClick={handleClosePopup}
                sx={{ mt: -1, mr: -1, color: "#aaa" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                {selectedNode.data.qfs_symbol}
              </Typography>
              <StarMenu ticker={selectedNode.data.qfs_symbol_id} />
            </Box>
            <Box
              sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 1, borderRadius: 1 }}>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "var(--text-color-grey-scale)" }}>
                <span style={{ color: "var(--text-color-grey-scale)" }}>{xAxisKey}:</span>{" "}
                <b style={{ color: "var(--header-color)" }}>{selectedNode.data.x?.toFixed(2)}</b>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "var(--text-color-grey-scale)" }}>
                <span style={{ color: "var(--text-color-grey-scale)" }}>{yAxisKey}:</span>{" "}
                <b style={{ color: "var(--header-color)" }}>{selectedNode.data.y?.toFixed(2)}</b>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "var(--text-color-grey-scale)" }}>
                <span style={{ color: "var(--text-color-grey-scale)" }}>Size:</span>{" "}
                <b style={{ color: "var(--header-color)" }}>
                  {formatMillions(selectedNode.data.z)}
                </b>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleNavigateToAnalysis(0)}
                sx={{
                  borderColor: "var(--border-input-fields)",
                  color: "var(--text-color-grey-scale)",
                  '&:hover': {
                    borderColor: "var(--action-color)",
                    color: "var(--header-color)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                }}>
                Go To Overview
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleNavigateToAnalysis(1)}
                sx={{
                  borderColor: "var(--border-input-fields)",
                  color: "var(--text-color-grey-scale)",
                  '&:hover': {
                    borderColor: "var(--action-color)",
                    color: "var(--header-color)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                }}>
                Go To Valuation
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 4. Watchlist Legend */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 2,
          justifyContent: "center",
        }}>
        <Chip
          label="All Companies"
          variant={focusedWatchlistId === null ? "filled" : "outlined"}
          onClick={() => setFocusedWatchlistId(null)}
          sx={{
            color: focusedWatchlistId === null ? "#1e1e1e" : "var(--text-color-grey-scale)",
            bgcolor:
              focusedWatchlistId === null ? "var(--action-color)" : "transparent",
            borderColor: "var(--border-input-fields)",
            fontWeight: focusedWatchlistId === null ? "bold" : "normal",
          }}
        />
        {watchlists.map((list) => (
          <Chip
            key={list.id}
            label={list.title}
            variant={focusedWatchlistId === list.id ? "filled" : "outlined"}
            onClick={() =>
              setFocusedWatchlistId(
                focusedWatchlistId === list.id ? null : list.id
              )
            }
            icon={
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: COLOR_WATCHLIST,
                }}
              />
            }
            sx={{
              color: focusedWatchlistId === list.id ? "#000" : "var(--text-color-grey-scale)",
              bgcolor:
                focusedWatchlistId === list.id
                  ? COLOR_WATCHLIST
                  : "transparent",
              borderColor:
                focusedWatchlistId === list.id ? COLOR_WATCHLIST : "var(--border-input-fields)",
              fontWeight: focusedWatchlistId === list.id ? "bold" : "normal",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FinancialScatterPlot;
