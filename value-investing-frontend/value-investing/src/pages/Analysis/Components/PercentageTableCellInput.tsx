import React from "react";
import TableCell from "@mui/material/TableCell";
import { NumericFormat } from "react-number-format";
import { OutlinedInput } from "@mui/material";

type PercentageTableCellInputProps = {
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

const SCALE_PERC = 100;

function PercentageTableCellInput({
  value,
  scalingFactor,
  handleChange,
  metricName,
  isEditable,
  valuationCase,
}: PercentageTableCellInputProps) {
  return (
    <TableCell>
      <NumericFormat
        id="taxrate-input"
        value={value * SCALE_PERC}
        decimalScale={1} // 1 decimal place
        decimalSeparator="." // use dot for decimal
        customInput={OutlinedInput}
        disabled={!isEditable}
        suffix="%"
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
                1 / SCALE_PERC
              );
            } else {
              handleChange(
                floatValue,
                metricName,
                valuationCase,
                1 / SCALE_PERC
              );
            }
          }
        }}
      />
    </TableCell>
  );
}

export default PercentageTableCellInput;
