import React from "react";
import TableCell from "@mui/material/TableCell";
import { NumericFormat } from "react-number-format";

type NumericTableCellProps = {
  cellValue: number;
  scalingFactor: number;
  decimalPlaces?: number;
  suffix?: string;
};

function NumericTableCell({
  cellValue,
  scalingFactor,
  decimalPlaces = 0,
  suffix = "",
}: NumericTableCellProps) {
  return (
    <TableCell key={cellValue}>
      {" "}
      <NumericFormat
        value={cellValue / scalingFactor}
        displayType="text"
        suffix={suffix}
        thousandSeparator=","
        decimalScale={decimalPlaces} // no decimals displayed for numeric table cells
        fixedDecimalScale={false} // important: show decimal only if needed
      />
    </TableCell>
  );
}

export default NumericTableCell;
