import React, { useMemo, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import { Box, Button, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux"; 

// --- STATIC CONFIGS ---

const PAPER_PROPS = {
  elevation: 0,
  sx: {
    borderRadius: "0px",
    border: "none",
    backgroundColor: "transparent !important",
    height: "100%",
  },
};

const HEADER_CELL_PROPS = {
  sx: {
    backgroundColor: "var(--table-header-actions-bg-color) !important",
    color: "var(--header-color) !important",
    fontFamily: "var(--font-family)",
    fontWeight: "700",
    borderBottom: "1px solid var(--border-input-fields)",
    fontSize: "0.85rem",
    letterSpacing: "0.5px",
  },
};

const BODY_CELL_PROPS = {
  sx: {
    color: "var(--header-color)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    fontFamily: "var(--font-family)",
    fontSize: "0.9rem",
    paddingY: "4px",
  },
};

const TOP_TOOLBAR_PROPS = {
  sx: { display: "none" },
};

const BOTTOM_TOOLBAR_PROPS = {
  sx: {
    backgroundColor: "transparent",
    color: "var(--text-color-grey-scale)",
    borderTop: "1px solid var(--border-input-fields)",
    minHeight: "40px",
  },
};

// Helper for row styling
const getBodyRowProps = ({ row }) => ({
  sx: {
    backgroundColor:
      row.index % 2 === 0
        ? "var(--background-glass-card-less-transparent)"
        : "transparent",
    "&:hover": {
      backgroundColor: "var(--input-fields-hover-bg-color) !important",
    },
    "& td": {
      backgroundColor: "transparent !important",
    },
  },
});

// Helper for empty state
const renderEmptyRowsFallback = () => (
  <Box
    sx={{
      p: 4,
      textAlign: "center",
      color: "var(--text-color-grey-scale)",
      fontStyle: "italic",
    }}
  >
    [ EMPTY LIST ]
  </Box>
);

// --- HELPER FUNCTIONS ---

const calculateMOS = (price, target) => {
  if (!price || !target) return null;
  return ((target - price) / target) * 100;
};

const WatchlistTable = ({ data, onRemove }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
            {
        accessorKey: "name",
        header: "COMPANY NAME",
        size: 180,
        Cell: ({ cell }) => (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', display: 'block' }}>
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "last_close_price",
        header: "PRICE",
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span style={{ fontFamily: "monospace", fontSize: "1rem" }}>
            {cell.getValue() ? cell.getValue().toFixed(2) : "-"}
          </span>
        ),
      },
      {
        accessorKey: "price_target",
        header: "TARGET",
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: cell.getValue() ? 'inherit' : 'gray' }}>
            {cell.getValue() ? cell.getValue().toFixed(2) : "-"}
          </span>
        ),
      },
      {
        id: "margin_of_safety", 
        header: "MOS %",
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const price = row.original.last_close_price;
          const target = row.original.price_target;
          const mos = calculateMOS(price, target);
          
          if (mos === null) return <span style={{color:'gray'}}>-</span>;
          
          const color = mos > 0 ? "var(--success-color)" : "var(--error-red)";
          
          return (
            <span style={{ color: color, fontWeight: "bold", fontFamily: "monospace" }}>
              {mos.toFixed(1)}%
            </span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "NOTES",
        size: 200,
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue() || ""} arrow placement="top">
            <span
                style={{
                display: "-webkit-box",
                WebkitLineClamp: 1, 
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: "gray",
                cursor: cell.getValue() ? 'help' : 'default'
                }}
            >
                {cell.getValue() || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "valuation_date",
        header: "VAL. DATE",
        size: 110,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => (
          <span style={{ color: "gray", fontSize: "0.8rem" }}>
            {cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : "-"}
          </span>
        ),
      },
    ],
    []
  );

  const renderRowActions = useCallback(
    ({ row }) => (
      <Button
        onClick={() => onRemove(row.original.qfs_symbol || row.original.ticker)}
        size="small"
        disableRipple
        sx={{
          minWidth: 0,
          color: "var(--text-color-grey-scale)",
          "&:hover": { color: "var(--error-red)", bgcolor: "transparent" },
        }}
      >
        [X]
      </Button>
    ),
    [onRemove]
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowActions
      positionActionsColumn="last"
      layoutMode="grid"
      initialState={{ density: "compact" }}
      
      muiTablePaperProps={PAPER_PROPS}
      muiTableHeadCellProps={HEADER_CELL_PROPS}
      muiTableBodyCellProps={BODY_CELL_PROPS}
      muiTopToolbarProps={TOP_TOOLBAR_PROPS}
      muiBottomToolbarProps={BOTTOM_TOOLBAR_PROPS}
      
      muiTableBodyRowProps={getBodyRowProps}
      renderEmptyRowsFallback={renderEmptyRowsFallback}
      renderRowActions={renderRowActions}
    />
  );
};

export default React.memo(WatchlistTable);