import { MaterialReactTable } from "material-react-table";
import React, { useMemo } from "react";
import "./styles.css";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

function ExampleTableSecond() {
  const data = useMemo(
    () => [
      {
        symbol: "ABC",
        name: "Alpha Beta Corp",
        pe: 15.5,
        revGrowth: "12.3%",
        debtEq: 0.4,
      },
      {
        symbol: "XYZ",
        name: "Xenon Yttrium Zeta Inc",
        pe: 18.2,
        revGrowth: "15.1%",
        debtEq: 0.3,
      },
      {
        symbol: "LMN",
        name: "Lambda Mu Nu Ltd",
        pe: 12.8,
        revGrowth: "11.7%",
        debtEq: 0.2,
      },
      {
        symbol: "PQR",
        name: "Pi Q Rho LLC",
        pe: 19.7,
        revGrowth: "13.5%",
        debtEq: 0.5,
      },
      {
        symbol: "UVW",
        name: "Upsilon Vega W Inc",
        pe: 16.9,
        revGrowth: "14.2%",
        debtEq: 0.4,
      },
      {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        pe: 19.9,
        revGrowth: "18.5%",
        debtEq: 0.1,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        pe: 17.2,
        revGrowth: "13.8%",
        debtEq: 0.45,
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "symbol",
        header: "Symbol",
        Cell: ({ cell }) => (
          <span className="symbol-cell">{cell.getValue()}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Company Name",
        Cell: ({ cell }) => (
          <span className="company-cell">{cell.getValue()}</span>
        ),
      },
      {
        accessorKey: "pe",
        header: "P/E",
        Cell: ({ cell }) => (
          <span className="neutral-cell">
            {Number(cell.getValue()).toFixed(1)}
          </span>
        ),
      },
      {
        accessorKey: "revGrowth",
        header: "Rev. Growth",
        Cell: ({ cell }) => (
          <span className="growth-cell">{cell.getValue()}</span>
        ),
      },
      {
        accessorKey: "debtEq",
        header: "Debt/Eq.",
        Cell: ({ cell }) => (
          <span className="neutral-cell">
            {Number(cell.getValue()).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="page-bg">
      <div className="glass-wrapper">
        <MaterialReactTable
          columns={columns}
          data={data}
          enableColumnOrdering
          enableColumnResizing
          enableSorting
          enablePagination
          // THIS is the important part: style the MRT Paper & container
          muiPaperProps={{
            elevation: 0,
            sx: {
              backgroundColor: "rgba(255,255,255,0.60)", // translucent white
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(79,70,229,0.10)",
              borderRadius: "12px",
              overflow: "hidden",
            },
          }}
          muiTableContainerProps={{
            sx: {
              backgroundColor: "transparent", // let Paper show through
            },
            className: "mrt-table-container",
          }}
          muiTableProps={{
            sx: {
              backgroundColor: "transparent",
            },
          }}
          // header/row/cell class names for CSS control
          muiTableHeadRowProps={{ className: "table-header-row" }}
          muiTableHeadCellProps={{ className: "table-header-cell" }}
          muiTableBodyRowProps={({ row }) => ({
            className: row.index % 2 === 0 ? "table-row even" : "table-row odd",
          })}
          muiTableHeadCellDragHandleProps={{
            sx: {
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            },
            children: (
              <DragIndicatorIcon fontSize="small" sx={{ color: "#4f46e5" }} />
            ),
          }}
          muiTableBodyCellProps={{ className: "table-body-cell" }}
          // small pagination styling via prop
          muiPaginationProps={{
            showFirstButton: true,
            showLastButton: true,
          }}
          initialState={{ pagination: { pageSize: 5, pageIndex: 0 } }}
        />
      </div>
    </div>
  );
}

export default ExampleTableSecond;
