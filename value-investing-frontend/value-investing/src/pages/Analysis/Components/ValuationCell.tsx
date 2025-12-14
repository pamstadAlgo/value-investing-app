import TableCell from "@mui/material/TableCell";
import { OutlinedInput } from "@mui/material";
import React, { useState } from "react";
import { AppDispatch } from "src/app/store";
import { useDispatch, useSelector } from "react-redux";
import { updateValuationData } from "src/features/analysisSlice";
import Tooltip from "@mui/material/Tooltip";

type ValuationChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  metricName: string,
  valuationCase: number,
  scaleFactor: number
) => void;

type ValuationCellProps = {
  isEditable: boolean;
  //   handleChange: ValuationChangeHandler;
  value: number | string;
  metricName: string;
  index: number;
  scaleFac: number;
};

export default function ValuationCell({
  isEditable,
  //   handleChange,
  value,
  metricName,
  index,
  scaleFac,
}: ValuationCellProps) {
  const [valueError, setValueError] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
//   const valuationData = useSelector((state) => state?.analysis?.valuationData);

  function handleValuationChange(
    e: React.ChangeEvent<HTMLInputElement>,
    metricName: string,
    valuationCase: number,
    scaleFactor: number
  ): void {
    dispatch(
      updateValuationData({
        newValue: e.target.value,
        metricName: metricName,
        caseIndex: valuationCase,
        scaleFactor: scaleFactor,
      })
    );

    //check if valid number
    if (isNaN(Number(e.target.valueAsNumber))) {
      setValueError(true);
    } else {
      setValueError(false);
    }
  }

  return (
    <TableCell>
      <Tooltip
        placement="right-start"
        arrow
        open={valueError}
        title="Invalid number">
        <OutlinedInput
          disabled={!isEditable}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          //   handleChange(e, metricName, index, scaleFac)
          // }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleValuationChange(e, metricName, index, scaleFac)
          }
          type="number"
          value={value}
          size="small"
          className="custom-input-valuation-table"
        />
      </Tooltip>
    </TableCell>
  );
}
