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
        muiTableProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "transparent",
          },
        }}
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
        muiTableHeadCellProps={{
          className: "table-header-cell",
        }}
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
