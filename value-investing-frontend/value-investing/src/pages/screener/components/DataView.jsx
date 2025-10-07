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

function DataView() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
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
        screenerState.queryResult.map((item) =>
          item.qfs_symbol_id 
        )
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

  return (
    <>
      {" "}
      <MaterialReactTable table={table} />{" "}
      <ColumnAddModal isOpen={isModalOpen} handleClose={handleClose} />
    </>
  );
}

export default DataView;
