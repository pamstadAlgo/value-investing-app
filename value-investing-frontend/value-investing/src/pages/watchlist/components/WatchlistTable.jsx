import React, { useMemo, useCallback, useState } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, Button, Tooltip, Menu, MenuItem, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BackdropLoading from "../../GlobalComponents/BackdropLoading";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { useSnackbar } from "../../GlobalComponents/SnackbarProvider";
import {
  initializeTickerSymbol,
  initializeCompanyData,
  initializeValuationData,
  initalizeBalanceSheet,
} from "../../../features/analysisSlice";

// --- STYLING CONFIGS ---

const COMMON_CELL_STYLES = {
  fontFamily: "var(--font-family)",
  fontSize: "0.80rem",
  padding: "4px 8px",
  textAlign: "left",
  height: "40px",
};

const PAPER_PROPS = {
  elevation: 0,
  sx: {
    borderRadius: "0px",
    border: "none",
    backgroundColor: "transparent !important",
    flex: "1",
  },
};

const HEADER_CELL_PROPS = {
  sx: {
    ...COMMON_CELL_STYLES,
    backgroundColor: "var(--table-header-actions-bg-color) !important",
    color: "var(--header-color) !important",
    fontWeight: "700",
    borderBottom: "1px solid var(--border-input-fields)",
    textTransform: "uppercase",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
};

const BODY_CELL_PROPS = {
  sx: {
    ...COMMON_CELL_STYLES,
    color: "var(--inner-text-input-fields)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
};

// --- CUSTOM TOOLTIP STYLE (Dark Theme) ---
const TooltipProps = {
  tooltip: {
    sx: {
      bgcolor: "var(--background-glass-card-less-transparent)", // Dark background
      color: "var(--inner-text-input-fields)", // Light text
      border: "1px solid var(--border-input-fields)",
      fontSize: "0.75rem",
      fontFamily: "var(--font-family)",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    },
  },
  arrow: {
    sx: {
      color: "var(--background-glass-card-less-transparent)",
    },
  },
};

// --- HELPER FUNCTIONS ---

const calculateMOS = (price, target) => {
  if (!price || !target) return null;
  return ((target - price) / price) * 100;
};

const isStale = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 90;
};

const formatMarketCap = (val) => {
  if (!val) return "-";
  if (val > 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
  if (val > 1000000) return `${(val / 1000000).toFixed(1)}M`;
  return val.toLocaleString();
};

const WatchlistTable = ({ data, onRemove }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();
  const { showMessage } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTickerData, setSelectedTickerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTickerData(null);
  };

  const handleNavigateToAnalysis = (targetTab) => {
    handleCloseMenu();

    if (selectedTickerData) {
      const symbol = selectedTickerData.qfs_symbol || selectedTickerData.ticker;
      const normalizedTickerData = {
        ...selectedTickerData,
        qfs_symbol: symbol,
      };

      dispatch(initializeTickerSymbol(normalizedTickerData));
      //fetching of data is handled on analysis page
      navigate("/analysis", { state: { initialTab: targetTab } });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Company",
        size: 220, // Increased size to prevent immediate truncation
        enableSorting: true,
        Cell: ({ cell, row }) => (
          <Box
            sx={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%", // Allow it to fill the column width
                cursor: "pointer",
                color: "var(--header-color)",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
              className="hover-underline"
              onClick={(event) => {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
                setSelectedTickerData(row.original);
              }}>
              {cell.getValue()}
            </span>
            <span
              style={{
                fontSize: "0.70rem",
                color: "var(--text-color-grey-scale)",
                fontWeight: 500,
              }}>
              {row.original.ticker}
            </span>
          </Box>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        size: 110,
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue() || ""} slotProps={TooltipProps}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100px",
                display: "block",
                fontSize: "0.75rem",
                color: "var(--text-color-grey-scale)",
              }}>
              {cell.getValue() || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "market_cap",
        header: "Mkt Cap",
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span
            style={{
              fontFamily: "monospace",
              color: "var(--text-color-grey-scale)",
            }}>
            {formatMarketCap(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "last_close_price",
        header: "Price",
        size: 90,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span style={{ fontFamily: "monospace", fontSize: "0.90rem" }}>
            {cell.getValue() ? (
              cell.getValue().toFixed(2)
            ) : (
              <span style={{ opacity: 0.3 }}>-</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "price_target",
        header: "Target",
        size: 90,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: cell.getValue() ? "var(--header-color)" : "gray",
            }}>
            {cell.getValue() ? (
              cell.getValue().toFixed(2)
            ) : (
              <span style={{ opacity: 0.3 }}>-</span>
            )}
          </span>
        ),
      },
      {
        id: "margin_of_safety",
        header: "MoS %",
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const price = row.original.last_close_price;
          const target = row.original.price_target;
          const mos = calculateMOS(price, target);

          if (mos === null)
            return <span style={{ color: "gray", opacity: 0.3 }}>-</span>;

          const color = mos > 0 ? "var(--success-color)" : "var(--error-red)";
          const sign = mos > 0 ? "+" : "";

          return (
            <Chip
              label={`${sign}${mos.toFixed(1)}%`}
              size="small"
              sx={{
                height: "20px",
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: color,
                bgcolor:
                  mos > 0
                    ? "rgba(76, 175, 80, 0.08)"
                    : "rgba(244, 67, 54, 0.08)",
                border: `1px solid ${
                  mos > 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)"
                }`,
                "& .MuiChip-label": { padding: "0px 6px" },
              }}
            />
          );
        },
      },
      {
        accessorKey: "valuation_date",
        header: "Val. Date",
        size: 90,
        Cell: ({ cell }) => {
          const dateStr = cell.getValue();
          const stale = isStale(dateStr);
          const dateColor = stale ? "var(--warning-yellow, #ff9800)" : "gray";

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  color: dateColor,
                  fontSize: "0.75rem",
                  fontWeight: stale ? 600 : 400,
                }}>
                {dateStr ? new Date(dateStr).toLocaleDateString() : "-"}
              </span>
              {stale && (
                <Tooltip
                  title="Valuation is outdated (> 90 days)"
                  slotProps={TooltipProps}>
                  <WarningAmberIcon sx={{ fontSize: 14, color: dateColor }} />
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "analyst_name",
        header: "Analyst",
        size: 110,
        Cell: ({ cell }) => (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-color-grey-scale)",
              fontSize: "0.75rem",
            }}>
            {cell.getValue() ? (
              <PersonIcon
                sx={{
                  fontSize: 14,
                  color: "var(--action-color-more-transparent)",
                }}
              />
            ) : null}
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "90px",
              }}>
              {cell.getValue() || "-"}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        size: 180,
        Cell: ({ cell }) => (
          <Tooltip
            title={cell.getValue() || "No notes"}
            arrow
            placement="top"
            slotProps={TooltipProps}>
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontStyle: "italic",
                color: "var(--text-color-grey-scale)",
                cursor: cell.getValue() ? "help" : "default",
                fontSize: "0.75rem",
              }}>
              {cell.getValue() || "-"}
            </span>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const renderRowActions = useCallback(
    ({ row }) => (
      <Tooltip title="Remove from watchlist" slotProps={TooltipProps}>
        <Button
          onClick={() =>
            onRemove(row.original.qfs_symbol || row.original.ticker)
          }
          size="small"
          sx={{
            minWidth: "24px",
            height: "24px",
            color: "var(--text-color-grey-scale)",
            opacity: 0.3,
            padding: 0,
            fontSize: "1.2rem",
            lineHeight: 1,
            "&:hover": {
              color: "var(--error-red)",
              opacity: 1,
              bgcolor: "rgba(244, 67, 54, 0.1)",
            },
          }}>
          &times;
        </Button>
      </Tooltip>
    ),
    [onRemove]
  );

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableRowActions
        positionActionsColumn="last"
        // --- RESIZING ENABLED ---
        enableColumnResizing={true}
        enablePagination
        columnResizeMode="onChange"
        // layoutMode="grid" // Needed for resizing to work effectively
        initialState={{
          density: "compact",
          pagination: {
            pageIndex: 0,
            pageSize: 35,
          },
        }}
        muiTablePaperProps={PAPER_PROPS}
        muiTableHeadCellProps={HEADER_CELL_PROPS}
        muiTableBodyCellProps={BODY_CELL_PROPS}
        // Fixes the "White on White" menu issue by forcing dark mode paper styles on column menus
        muiColumnActionsButtonProps={{
          sx: {
            color: "var(--text-color-grey-scale)",
          },
        }}
        muiTableHeadCellColumnActionsButtonProps={{
          sx: {
            "& .MuiIconButton-root": { color: "var(--text-color-grey-scale)" },
          },
        }}
        renderColumnActionsMenuItems={({
          closeMenu,
          internalColumnMenuItems,
        }) => {
          return internalColumnMenuItems.map((item) =>
            React.cloneElement(item, {
              sx: {
                color: "var(--text-color) !important",
                bgcolor: "var(--background-glass-card) !important",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1) !important" },
              },
              onClick: (e) => {
                item.props.onClick(e);
                closeMenu();
              },
            })
          );
        }}
        muiTopToolbarProps={{ sx: { display: "none" } }}
        muiBottomToolbarProps={{
          sx: {
            bgcolor: "transparent",
            borderTop: "1px solid var(--border-input-fields)",
            color: "var(--text-color-grey-scale)",
            // minHeight: "32px",
          },
        }}
        muiTableBodyRowProps={({ row }) => ({
          sx: {
            backgroundColor:
              row.index % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            },
            height: "50px",
            minHeight: "40px",
          },
        })}
        renderEmptyRowsFallback={() => (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "gray",
              fontStyle: "italic",
            }}>
            [ EMPTY WATCHLIST ]
          </Box>
        )}
        renderRowActions={renderRowActions}
      />

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: "var(--background-glass-card, #1e1e1e)",
            color: "var(--text-color)",
            border: "1px solid var(--border-input-fields)",
            backgroundImage: "none",
          },
        }}>
        <MenuItem onClick={() => handleNavigateToAnalysis(0)}>
          Go to Overview
        </MenuItem>
        <MenuItem onClick={() => handleNavigateToAnalysis(1)}>
          Go to Valuation
        </MenuItem>
      </Menu>

      <BackdropLoading open={isLoading} />
    </>
  );
};

export default React.memo(WatchlistTable);
