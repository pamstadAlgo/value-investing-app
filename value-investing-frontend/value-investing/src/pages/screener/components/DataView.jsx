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
import MenuOpenIcon from "@mui/icons-material/MenuOpen"; // <-- your custom icon

function DataView() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

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
      let columns = [];

      for (const [key, value] of Object.entries(queryObject)) {
        if (typeof value === "number") {
          columns.push({
            accessorKey: key,
            header: key,
            // size: 150,
            Cell: ({ cell }) => cell.getValue()?.toFixed(2),
          });
        } else {
          columns.push({
            accessorKey: key,
            header: key,
            // size: 150,
          });
        }
      }

      return columns;
    }
    return [];
  }, [screenerState.queryResult]);

  const extractDataViewTickers = useMemo(() => {
    dispatch(
      setDataViewTickers(
        screenerState.queryResult.map((item) => item.qfs_symbol_id)
      )
    );
  }, [screenerState.queryResult]);

  const handleColumnAdd = () => {
    //we need to open modal
    setIsModalOpen(true);

    //extract all ids
    const ids = screenerState.queryResult.map((item) => item.qfs_symbol_id);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: screenerState.queryResult,
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

  console.log("columns we pass: ", columns);

  return (
    <div className="table-container">
      {/* <MaterialReactTable table={table} /> */}
      <MaterialReactTable
        columns={columns}
        data={screenerState.queryResult}
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
                }
            }}

            // 2. Force the Top Toolbar (Search/Filters) to be Dark
            muiTopToolbarProps={{
                sx: {
                    backgroundColor: "var(--table-header-actions-bg-color)", // Dark #181818
                    color: "var(--header-color)", // Orange
                    borderBottom: "1px solid var(--border-input-fields)",
                }
            }}

            // 3. Force the Bottom Toolbar (Pagination) to be Dark
            muiBottomToolbarProps={{
                sx: {
                    backgroundColor: "transparent",
                    color: "var(--text-color-grey-scale)",
                    borderTop: "1px solid var(--border-input-fields)",
                }
            }}

            // 4. Force the Table Body to be transparent
            muiTableBodyProps={{
                sx: {
                    '& tr:nth-of-type(odd)': {
                        backgroundColor: 'transparent',
                    },
                    '& tr:nth-of-type(even)': {
                        backgroundColor: 'var(--background-glass-card-less-transparent)',
                    },
                    '& tr:hover': {
                        backgroundColor: 'var(--input-fields-hover-bg-color)',
                    },
                }
            }}

            // 5. Force the Table Head to be Dark
            muiTableHeadCellProps={{
                sx: {
                    backgroundColor: "var(--table-header-actions-bg-color)",
                    color: "var(--header-color)",
                    fontFamily: "var(--font-family)",
                    fontWeight: "600",
                    borderBottom: "1px solid var(--border-input-fields)",
                }
            }}
            
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
        muiTableBodyRowProps={({ row }) => ({
          className: row.index % 2 === 0 ? "table-row even" : "table-row odd",
        })}
        muiTableBodyCellProps={{
          className: "table-body-cell",
        }}
        muiPaginationProps={{
          shape: "rounded",
          variant: "outlined",
          color: "primary",
        }}
      />
      <ColumnAddModal isOpen={isModalOpen} handleClose={handleClose} />
    </div>
  );
}

export default DataView;
