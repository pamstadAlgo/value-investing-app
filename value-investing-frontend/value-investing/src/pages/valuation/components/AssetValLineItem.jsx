import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import { OutlinedInput } from "@mui/material";

function AssetValLineItem({
  open,
  label,
  value,
  metric,
  handleChange,
  multiplier,
  handleMultiplierChange,
  category,
}) {
  return (
    <TableRow className={`custom-table-row ${open ? "open" : ""}`}>
      <TableCell className={`custom-cell ${open ? "" : "no-padding-cell"}`}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <span style={{ marginLeft: "54px" }}>{label}</span>
        </Collapse>
      </TableCell>
      <TableCell
        align="right"
        className={`custom-cell ${open ? "" : "no-padding-cell"}`}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <OutlinedInput
            onChange={(e) => handleChange(e, category, metric)}
            type="number"
            value={value}
            size="small"
            className="custom-input-valuation-table"
          />
        </Collapse>
      </TableCell>
      <TableCell
        align="right"
        className={`custom-cell ${open ? "" : "no-padding-cell"}`}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <OutlinedInput
            value={multiplier}
            onChange={(e) => handleMultiplierChange(e, category, metric)}
            // disabled={isDerived}
            type="number"
            // value={bull}
            size="small"
            className="custom-input-valuation-table"
            // onBlur={(e) => handleChange(e, metricName, 1)}
            // onChange={(e) => handleChange(e, metricName, 2)}
          />
        </Collapse>
      </TableCell>
      <TableCell
        align="right"
        className={`custom-cell ${open ? "" : "no-padding-cell"}`}>
        {" "}
        <Collapse in={open} timeout="auto" unmountOnExit>
          {multiplier * value}
        </Collapse>
      </TableCell>
    </TableRow>
  );
}

export default AssetValLineItem;
