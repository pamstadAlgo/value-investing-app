import { OutlinedInput } from "@mui/material";
import React from "react";
import { NumericFormat } from "react-number-format";
import TableCell from "@mui/material/TableCell";

type NumericTableCellInputProps = {
  value: number | null;
  scalingFactor: number;
  metricName: string;
  isEditable: boolean;
  valuationCase: 0 | 1 | 2;
  handleChange: (
    value: number | null,
    metricName: string,
    valuationCase: number,
    scaleFactor: number
  ) => void;
};

function NumericTableCellInput({
  value,
  scalingFactor,
  handleChange,
  metricName,
  isEditable,
  valuationCase,
}: NumericTableCellInputProps) {
  return (
    <TableCell>
      <NumericFormat
        value={value / scalingFactor}
        decimalScale={0} // 1 decimal place
        fixedDecimalScale={false} // important: show decimal only if needed
        thousandSeparator=","
        customInput={OutlinedInput}
        disabled={!isEditable}
        size="small"
        className="custom-input-valuation-table"
        onValueChange={(values) => {
          if (isEditable) {
            const { floatValue } = values;
            if (floatValue != null) {
              handleChange(
                floatValue,
                metricName,
                valuationCase,
                scalingFactor
              );
            } else {
              handleChange(
                floatValue,
                metricName,
                valuationCase,
                scalingFactor
              );
            }
          }
        }}
      />
    </TableCell>
  );
}

export default NumericTableCellInput;
