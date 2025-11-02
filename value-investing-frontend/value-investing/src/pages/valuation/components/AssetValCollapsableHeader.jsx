import React from "react";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";

function AssetValCollapsableHeader({
  columnWidths,
  handleClick,
  open,
  openCollapse,
  label,
  hasCellPadding,
  marginLeft,
}) {
  return (
    <TableRow className={`custom-table-row ${hasCellPadding ? "open" : ""}`}>
      <TableCell
        style={{ width: columnWidths[0] }}
        className={`custom-cell ${hasCellPadding ? "" : "no-padding-cell"}`}>
        <Collapse in={openCollapse} timeout="auto" unmountOnExit>
          <IconButton
            style={{ marginLeft: marginLeft }}
            aria-label="expand row"
            size="small"
            onClick={handleClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>

          <span>{label}</span>
        </Collapse>
      </TableCell>
      <TableCell
        className={`custom-cell ${hasCellPadding ? "" : "no-padding-cell"}`}
        style={{ width: columnWidths[1] }}></TableCell>
      <TableCell
        className={`custom-cell ${hasCellPadding ? "" : "no-padding-cell"}`}
        style={{ width: columnWidths[2] }}></TableCell>
      <TableCell
        className={`custom-cell ${hasCellPadding ? "" : "no-padding-cell"}`}
        style={{ width: columnWidths[3] }}
        align="right">
        <Collapse in={openCollapse} timeout="auto" unmountOnExit>
          100'000
        </Collapse>
      </TableCell>
    </TableRow>
  );
}

export default AssetValCollapsableHeader;
