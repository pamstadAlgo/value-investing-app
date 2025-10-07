import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

//define preferred column order
const preferredColumnOrder = [
  "Symbol",
  "Sector",
  "Price Today",
  "EPV (TTM)",
  "EPV",
  "Penman (TTM)",
  "Penman",
  "g (TTM)",
  "DWP",
  // etc.
];

function DataView() {
  const mccState = useSelector((state) => state.microcap);

  //define columns of table
  const columns = useMemo(() => {
    //check if profiles are fetched; if not we return empty array
    if (mccState?.mccProfiles.length > 0) {
      //get first object to extract column names
      const mccProfileObject = mccState.mccProfiles[0];

      //iterate through key and values
      let columns = [];

      // Sort keys by preferred order
      const sortedKeys = Object.keys(mccProfileObject).sort((a, b) => {
        const indexA = preferredColumnOrder.indexOf(a);
        const indexB = preferredColumnOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      return sortedKeys.map((key) => ({
        accessorKey: key,
        header: key,
        Cell:
          typeof mccProfileObject[key] === "number"
            ? ({ cell }) => cell.getValue()?.toFixed(2)
            : undefined,
      }));

      for (const [key, value] of Object.entries(mccProfileObject)) {
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
    } else {
      return [];
    }
  }, [mccState.mccProfiles]);

  //define table
  const table = useMaterialReactTable({
    columns,
    enableStickyHeader: true,
    data: mccState.mccProfiles,
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
    // 👇 This makes columns auto-fit available width
    columnResizeMode: "fit",
    enableColumnResizing: true,
  });

  return (
    <div style={{ width: "100%" }}>
      <MaterialReactTable table={table} />{" "}
    </div>
  );
}

export default DataView;
