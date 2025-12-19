import React from "react";
import TableCell from "@mui/material/TableCell";
import { NumericFormat } from "react-number-format";

type PercentageTableCellProps = {
  cellValue: number;
  scalingFactor: number;
};

function PercentageTableCell({
  cellValue,
  scalingFactor,
}: PercentageTableCellProps) {
  return (
    <TableCell key={cellValue}>
      {" "}
      <NumericFormat
        value={cellValue * scalingFactor} // e.g., 0.125 → 12.5
        displayType="text"
        decimalScale={1}
        fixedDecimalScale={false}
        suffix="%"
        thousandSeparator=","
      />
    </TableCell>
  );
}

export default PercentageTableCell;
