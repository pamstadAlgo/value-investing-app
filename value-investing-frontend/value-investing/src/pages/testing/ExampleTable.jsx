import React, { useMemo } from "react";
import "./styles.css";
import { MaterialReactTable } from "material-react-table";
// import MaterialReactTable from "material-react-table";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MenuOpenIcon from "@mui/icons-material/MenuOpen"; // <-- your custom icon
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined";
function ExampleTable() {
  const SmallDragIcon = (props) => (
    <PanToolOutlinedIcon
      {...props}
      style={{
        fontSize: 18,
        marginRight: "4px",
      }}
    />
  );
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
          <span className="neutral-cell">{cell.getValue().toFixed(1)}</span>
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
          <span className="neutral-cell">{cell.getValue().toFixed(2)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="table-container">
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnOrdering
        enableColumnResizing
        enableSorting
        enablePagination
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
    </div>
  );
}

export default ExampleTable;
