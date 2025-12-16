import React from "react";
import TableCell from "@mui/material/TableCell";
import { NumericFormat } from "react-number-format";

type NumericTableCellProps = {
  cellValue: number;
  scalingFactor: number;
};

function NumericTableCell({ cellValue, scalingFactor }: NumericTableCellProps) {
  return (
    <TableCell key={cellValue}>
      {" "}
      <NumericFormat
        value={cellValue / scalingFactor}
        displayType="text"
        thousandSeparator=","
        decimalScale={0} // no decimals displayed for numeric table cells
        fixedDecimalScale={false} // important: show decimal only if needed
      />
    </TableCell>
  );
}

export default NumericTableCell;
