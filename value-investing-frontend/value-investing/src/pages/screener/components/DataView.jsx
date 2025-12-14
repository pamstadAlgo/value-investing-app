import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ColumnAddModal from "./ColumnAddModal";
import { setDataViewTickers } from "../../../features/stockScreenerSlice";
import "./screenerTableStyles.css";
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import StarMenu from "../../GlobalComponents/StarMenu"; // <-- Import StarMenu
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import BackdropLoading from "../../GlobalComponents/BackdropLoading";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { useSnackbar } from "../../GlobalComponents/SnackbarProvider";
import {
  initializeTickerSymbol,
  initializeCompanyData,
  initializeValuationData,
  initalizeBalanceSheet,
} from "../../../features/analysisSlice";
import { setHighlightedTicker } from "../../../features/stockScreenerSlice";

function DataView() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  // --- NEW STATE & NAVIGATION LOGIC ---
  const navigate = useNavigate();
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
      setIsLoading(true);

      // FIX: Handle both qfs_symbol_id (from Screener) and qfs_symbol (Analysis convention)
      const symbol =
        selectedTickerData.qfs_symbol || selectedTickerData.qfs_symbol_id;

      // Create a normalized object to ensure Analysis page has the correct 'qfs_symbol' property
      const normalizedTickerData = {
        ...selectedTickerData,
        qfs_symbol: symbol,
      };

      // Initialize symbol in Redux
      dispatch(initializeTickerSymbol(normalizedTickerData));

      // 1. Fetch Analysis Data (Uses axiosInstanceAuth for token)
      const fetchAnalysis = axiosInstanceAuth
        .get(`screener/analysis/${symbol}/`)
        .then((response) => {
          dispatch(initializeCompanyData(response.data));
          dispatch(initializeValuationData(response?.data?.valuationDefaults));
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            showMessage("Session expired. Please log in again.", "error");
            navigate("/"); // Redirect to Login
            return;
          }
          // Show error to user
          showMessage(`Error fetching data: ${error.message || error}`);
          console.error("ERROR: GET screener/analysis/: ", error);
          throw error;
        });

      // 2. Fetch Balance Sheet Data (Uses axiosInstanceAuth for token)
      const fetchBalanceSheet = axiosInstanceAuth
        .post("/screener/asset-val-fundamentals/", {
          qfs_symbols: [symbol],
        })
        .then((response) => {
          dispatch(initalizeBalanceSheet(response.data[0]?.data));
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            return;
          }
          showMessage(`Error computing asset val ${error}`, "error");
          console.error(
            "ERROR: POST /screener/asset-val-fundamentals/: ",
            error
          );
        });

      // Wait for requests to finish
      Promise.all([fetchAnalysis, fetchBalanceSheet])
        .then(() => {
          setIsLoading(false);
          // Navigate only after successful fetch
          navigate("/analysis", { state: { initialTab: targetTab } });
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };
  // ------------------------------------

  const SmallDragIcon = (props) => (
    <PanToolOutlinedIcon
      {...props}
      style={{
        fontSize: 18,
        marginRight: "4px",
      }}
    />
  );

  //define columns
  const columns = useMemo(() => {
    //get the first element of the data to extract column identifiers + accessorKey
    if (screenerState?.queryResult.length > 0) {
      //extract properties of object
      // const properties = Object.keys(screenerState?.queryResult[0]);
      const queryObject = screenerState?.queryResult[0];
      let generatedColumns = [];

      // Create the dynamic columns from data
      for (const [key, value] of Object.entries(queryObject)) {
        // Define which columns are clickable
        const isClickable =
          key === "qfs_symbol" || key === "name" || key === "company";

        if (typeof value === "number") {
          generatedColumns.push({
            accessorKey: key,
            header: key,
            // size: 150,
            Cell: ({ cell }) => cell.getValue()?.toFixed(2),
          });
        } else {
          generatedColumns.push({
            accessorKey: key,
            header: key,
            // size: 150,
            Cell: ({ row, cell }) => {
              if (isClickable) {
                return (
                  <span
                    style={{
                      cursor: "pointer",
                      color: "var(--header-color)",
                      textDecoration: "underline",
                    }}
                    onClick={(event) => {
                      event.stopPropagation(); // Prevent default row click behavior
                      setAnchorEl(event.currentTarget);
                      setSelectedTickerData(row.original);
                    }}>
                    {cell.getValue()}
                  </span>
                );
              }
              return cell.getValue();
            },
          });
        }
      }

      // Prepend the Watchlist/StarMenu column
      return [
        {
          id: "watchlist", // Unique ID for the column
          header: "", // Empty header for the icon column
          size: 60, // Small width
          enableSorting: false,
          enableColumnFilter: false,
          enableColumnActions: false,
          enableColumnResizing: false,
          enableColumnOrdering: false,
          Cell: ({ row }) => (
            <div
              style={{ display: "flex", justifyContent: "center" }}
              onClick={(e) => e.stopPropagation()} // Prevent row click events
            >
              <StarMenu ticker={row.original.qfs_symbol_id} />
            </div>
          ),
        },
        ...generatedColumns,
      ];
    }
    return [];
  }, [screenerState.queryResult]);

  const extractDataViewTickers = useMemo(() => {
    if (screenerState.queryResult) {
      dispatch(
        setDataViewTickers(
          screenerState.queryResult.map((item) => item.qfs_symbol_id)
        )
      );
    }
  }, [screenerState.queryResult, dispatch]);

  const handleColumnAdd = () => {
    //we need to open modal
    setIsModalOpen(true);

    //extract all ids
    const ids = screenerState.queryResult.map((item) => item.qfs_symbol_id);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Note: 'table' instance defined here was unused in the return below
  // (replaced by direct component props), but kept logic consistent if you switch back.
  const table = useMaterialReactTable({
    columns,
    data: screenerState.queryResult || [],
    initialState: {
      density: "compact",
      columnVisibility: { id: false },
      pagination: {
        pageIndex: 0,
        pageSize: 35,
      },
    },
    enableRowSelection: true,
    enableColumnOrdering: true,
    renderTopToolbarCustomActions: () => {
      return (
        <div style={{ marginLeft: "auto" }}>
          <Tooltip title="Add column" arrow>
            <IconButton
              edge="start"
              onClick={handleColumnAdd}
              //   sx={{ mr: 2, display: { sm: "none" } }}
            >
              <PlaylistAddIcon />
            </IconButton>
          </Tooltip>
        </div>
      );
    },
  });

  {
    /* console.log("columns we pass: ", columns); */
  }

  return (
    <div className="table-container">
      {/* <MaterialReactTable table={table} /> */}
      <MaterialReactTable
        columns={columns}
        data={screenerState.queryResult || []} // Handle potential null/undefined
        // layoutMode="grid"

        enableColumnOrdering
        enableColumnResizing
        enableSorting
        enablePagination
        enableStickyHeader
        initialState={{
          density: "compact",
          columnVisibility: { id: false },
          pagination: {
            pageIndex: 0,
            pageSize: 35,
          },
        }}
        // --- START OF NEW STYLING PROPS ---

        // 1. Force the Main Paper (Container) to be transparent
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "0px",
            border: "none",
            backgroundColor: "transparent",
          },
        }}
        // 2. Force the Top Toolbar (Search/Filters) to be Dark
        muiTopToolbarProps={{
          sx: {
            backgroundColor: "var(--table-header-actions-bg-color)", // Dark #181818
            color: "var(--header-color)", // Orange
            borderBottom: "1px solid var(--border-input-fields)",
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            color: "var(--screener-table-cell-content-color)",
          },
        }}
        // 3. Force the Bottom Toolbar (Pagination) to be Dark
        muiBottomToolbarProps={{
          sx: {
            backgroundColor: "transparent",
            color: "var(--text-color-grey-scale)",
            borderTop: "1px solid var(--border-input-fields)",
          },
        }}
        // 4. Force the Table Body to be transparent
        muiTableBodyProps={{
          sx: {
            "& tr:nth-of-type(odd)": {
              backgroundColor: "transparent",
            },
            "& tr:nth-of-type(even)": {
              backgroundColor: "var(--background-glass-card-less-transparent)",
            },
            "& tr:hover": {
              backgroundColor: "var(--input-fields-hover-bg-color)",
            },
          },
        }}
        // muiTableHeadProps={{
        //   sx: {
        //     padding: "24px 8px",
        //   },
        // }}
        // 5. Force the Table Head to be Dark
        muiTableHeadCellProps={({ column }) => ({
          className: "table-header-cell",
          sx: {
            backgroundColor: "var(--table-header-actions-bg-color)",
            color: "var(--header-color)",
            fontFamily: "var(--font-family)",
            fontWeight: "600",
            padding: "24px 8px !important",
            borderBottom: "1px solid var(--border-input-fields)",
            "& .MuiSvgIcon-root": {
              color: "var(--screener-table-header-icons-color) !important", // change icon color
            },
            "& .Mui-TableHeadCell-ResizeHandle-Wrapper": {
              display: column.id === "watchlist" ? "none" : "block",
              "& hr.MuiDivider-root.MuiDivider-fullWidth": {
                borderColor: "var(--input-fields-icons-color) !important", // change handle color
              },
            },
          },
        })}
        // --- END OF NEW STYLING PROPS ---
        icons={{
          // ✅ This replaces the default drag handle icon:
          DragHandleIcon: SmallDragIcon,
          //   Men: SmallDragIcon,
        }}
        renderColumnActionsMenuIcon={() => (
          <MenuOpenIcon sx={{ color: "#4f46e5", fontSize: 20 }} />
        )}
        muiTableHeadRowProps={{
          className: "table-header-row",
        }}
        muiTableBodyRowProps={({ row }) => {
          const isHighlighted =
            row.original.qfs_symbol_id === screenerState.highlightedTicker;
          return {
            className: row.index % 2 === 0 ? "table-row even" : "table-row odd",
            sx: {
              backgroundColor: isHighlighted
                ? "rgba(255, 152, 0, 0.15) !important"
                : undefined,
              border: isHighlighted
                ? "1px solid var(--action-color) !important"
                : undefined,
              transition: "all 0.2s ease",
              // Optional: Scroll to view logic can be added here using refs if needed
            },
            onClick: () => {
              // Optional: Allow clicking row to highlight it in chart too
              dispatch(setHighlightedTicker(row.original.qfs_symbol_id));
            },
          };
        }}
      />
      <ColumnAddModal isOpen={isModalOpen} handleClose={handleClose} />

      {/* --- ANALYSIS NAVIGATION MENU --- */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            backgroundColor: "var(--background-glass-card, #1e1e1e)",
            color: "var(--text-color, #fff)",
            border: "1px solid var(--border-color, #333)",
          },
        }}>
        <MenuItem onClick={() => handleNavigateToAnalysis(0)}>
          Go to Company Overview
        </MenuItem>
        <MenuItem onClick={() => handleNavigateToAnalysis(1)}>
          Go to Valuation
        </MenuItem>
      </Menu>

      <BackdropLoading open={isLoading} />
    </div>
  );
}

export default DataView;
