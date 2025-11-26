import React, { useEffect, useState } from "react";
import TableRow from "@mui/material/TableRow";
import OutlinedInput from "@mui/material/OutlinedInput";
import TableCell from "@mui/material/TableCell";
import { useDispatch } from "react-redux";
import { updateEPVValuationData } from "../../../features/valuationSlice";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import BarChartNivo from "./BarChartNivo";
import Popper from "@mui/material/Popper";

function EPVBodyTableRow({
  metricName,
  bear,
  base,
  bull,
  qfsSymbol,
  isDerived,
  hasData,
  ts,
  description,
}) {
  const [errrorBearCase, setErrorBearCase] = useState(false);
  const [errrorBaseCase, setErrorBaseCase] = useState(false);
  const [errrorBullCase, setErrorBullCase] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useDispatch();

  /* 
  What we will do next:
  1. create an error state for bear, base, bull
  2. we set an error if in the handle change the e.target.valueAsNumber is nan
  3. We open the tooltip in case the error is true
  */

  const handleChange = (e, metricName, caseIndex) => {
    const val = e.target.value;

    dispatch(
      updateEPVValuationData({
        newValue: val,
        qfsSymbol: qfsSymbol,
        metricName: metricName,
        caseIndex: caseIndex,
      })
    );

    if (isNaN(Number(e.target.valueAsNumber))) {
      // check which error to set
      switch (caseIndex) {
        case 0:
          setErrorBearCase(true);
          console.log("we set error bear case");
          break;
        case 1:
          setErrorBaseCase(true);
          console.log("we set error base case");
          break;
        case 2:
          setErrorBullCase(true);
          console.log("we set error bull case");
          break;
      }
    } else {
      switch (caseIndex) {
        case 0:
          setErrorBearCase(false);
          console.log("we set error bear case");
          break;
        case 1:
          setErrorBaseCase(false);
          console.log("we set error base case");
          break;
        case 2:
          setErrorBullCase(false);
          console.log("we set error bull case");
          break;
      }
    }
    // }
    // setError(false);
    // } else {
    //   // Invalid input: show error
    //   setError(true);
    // }
  };

  const handleBlur = (e, metricName, caseIndex) => {
    // const val = e.target.value;
    // const val = e.target.valueAsNumber;

    console.log("e.target.value blur: ", e.target.value);
    console.log("e.target.valueAsNumber blur: ", e.target.valueAsNumber);
    console.log("transformed number: ", Number(e.target.value));

    //convert input to number in case it is valid
    if (!isNaN(Number(e.target.valueAsNumber))) {
      dispatch(
        updateEPVValuationData({
          newValue: e.target.valueAsNumber,
          qfsSymbol: qfsSymbol,
          metricName: metricName,
          caseIndex: caseIndex,
        })
      );
    }
  };

  const handleFocus = (e, metricName, caseIndex) => {
    // const val = e.target.value;
    // const val = e.target.valueAsNumber;

    console.log("focused value we set: ", e.target.value);
    // setFocusedValue(e.target.value);
  };

  //   useEffect(() => {
  //     if (open) {
  //       const t = setTimeout(() => {
  //         window.dispatchEvent(new Event("resize"));
  //       }, 1000); // small delay; adjust 0..200ms if needed
  //       return () => clearTimeout(t);
  //     }
  //   }, [open]);

  return (
    <TableRow
      className="custom-table-row-valuation"
      // key={row.name}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
      }}>
      <TableCell component="th" scope="row">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div>{metricName} </div>
          {isDerived && (
            <Tooltip
              placement="right-start"
              arrow
              //   open={errrorBearCase}
              title={description}>
              <div>
                {" "}
                <HelpOutlineOutlinedIcon className="custom-icon-table" />{" "}
              </div>
            </Tooltip>
          )}
          {hasData && (
            <div
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}>
              {" "}
              <PollOutlinedIcon className="custom-icon-table" />{" "}
              <Popper
                className="custom-popover-charts"
                // id="mouse-over-popover"
                // sx={{ pointerEvents: "none" }}
                open={open}
                anchorEl={anchorEl}
                placement="right-start"
                // anchorOrigin={{
                //   vertical: "bottom",
                //   horizontal: "left",
                // }}
                // transformOrigin={{
                //   vertical: "top",
                //   horizontal: "left",
                // }}
                onClose={handlePopoverClose}
                //   disableRestoreFocus
              >
                {/* <Typography sx={{ p: 1 }}>I use Popover.</Typography> */}
                <BarChartNivo
                  data={ts}
                  xAxisLabel="Year"
                  yAxisLabel={metricName}
                />
              </Popper>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell align="right">
        <Tooltip
          placement="right-start"
          arrow
          open={errrorBearCase}
          title="Invalid number">
          <div>
            <OutlinedInput
              disabled={isDerived}
              type="number"
              value={bear}
              onFocus={(e) => handleFocus(e, metricName, 0)}
              onBlur={(e) => handleBlur(e, metricName, 0)}
              // onBlur={(e) => handleChange(e, metricName, 0)}
              // onBlur={setError(false)}
              size="small"
              className="custom-input-valuation-table"
              onChange={(e) => {
                handleChange(e, metricName, 0);
              }}
            />
          </div>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <Tooltip
          placement="right-start"
          arrow
          open={errrorBaseCase}
          title="Invalid number">
          <OutlinedInput
            disabled={isDerived}
            type="number"
            value={base}
            size="small"
            onBlur={(e) => handleBlur(e, metricName, 1)}
            // onBlur={(e) => handleChange(e, metricName, 1)}
            className="custom-input-valuation-table"
            onChange={(e) => handleChange(e, metricName, 1)}
          />
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <Tooltip
          placement="right-start"
          arrow
          open={errrorBullCase}
          title="Invalid number">
          <OutlinedInput
            disabled={isDerived}
            type="number"
            value={bull}
            size="small"
            className="custom-input-valuation-table"
            // onBlur={(e) => handleChange(e, metricName, 1)}
            onChange={(e) => handleChange(e, metricName, 2)}
          />
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default EPVBodyTableRow;
