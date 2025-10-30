import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import OutlinedInput from "@mui/material/OutlinedInput";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import { updateEPVValuationData } from "../../../features/valuationSlice";
import EPVBodyTableRow from "./EPVBodyTableRow";
import {
  computeAdjustedIncome,
  computeEBIT,
  computeEPVOpBusiness,
  computeEpvPerShare,
  computeNOPAT,
} from "./selectorFunctions";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const exampleData = [
  { Revenue: [159, 237, 262] }, // bear, base, bull
  { "Operating Margin": [6.0, 9.0, 24] },
  { EBIT: [262, 16.0, 24] },
  { "D&A": [305, 3.7, 67] },
  { "Maintenance Capex": [356, 16.0, 49] },
  { "Adjusted Income": [356, 16.0, 49] },
  { "Tax Rate": [356, 16.0, 49] },
  { "Sustainable NOPAT": [356, 16.0, 49] },
  { WACC: [356, 16.0, 49] },
  { "EPV operating business": [356, 16.0, 49] },
  { Cash: [356, 16.0, 49] },
  { Debt: [356, 16.0, 49] },
  { "Nr. shares": [356, 16.0, 49] },
  { "EPV per share": [356, 16.0, 49] },
];

const rows = [
  createData("Revenue", 159, 6.0, 24),
  createData("Operating Margin", 237, 9.0, 37),
  createData("EBIT", 262, 16.0, 24),
  createData("D&A", 305, 3.7, 67),
  createData("Maintenance Capex", 356, 16.0, 49),
  createData("Adjusted Income", 356, 16.0, 49),
  createData("Tax Rate", 356, 16.0, 49),
  createData("Sustainable NOPAT", 356, 16.0, 49),
  createData("WACC", 356, 16.0, 49),
  createData("EPV operating business", 356, 16.0, 49),
  createData("Cash", 356, 16.0, 49),
  createData("Debt", 356, 16.0, 49),
  createData("Nr. shares", 356, 16.0, 49),
  createData("EPV per share", 356, 16.0, 49),
];

const columns = ["Bear Case", "Base Case", "Bull Case"];

function AccordionBodyEpv({ data, qfsSymbol }) {
  const [value, setValue] = useState("");
  // const [data, setData] = useState(exampleData);
  const [focusedValue, setFocusedValue] = useState("");
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e, metricName, caseIndex) => {
    const val = e.target.value;
    // const val = e.target.valueAsNumber;

    console.log("e.target.value: ", e.target.value);
    console.log("e.target.valueAsNumber: ", e.target.valueAsNumber);

    console.log("metricName: ", metricName);
    console.log("caseIndex: ", caseIndex);

    // Allow empty input or valid decimal numbers
    // if (
    //   val === "" ||
    //   /^-?$/.test(val) || // just "-" is fine
    //   /^-?\d+\.?\d*$/.test(val) || // digits, optional dot, then more digits
    //   /^-?\d*\.$/.test(val) // "1." or "-1." (user might still type decimals)
    // ) {
    // setValue(val);
    // if (!isNaN(Number(e.target.valueAsNumber))) {
    dispatch(
      updateEPVValuationData({
        newValue: val,
        qfsSymbol: qfsSymbol,
        metricName: metricName,
        caseIndex: caseIndex,
      })
    );
    // } else {

    if (isNaN(Number(e.target.valueAsNumber))) {
      console.log(
        "error with e.target.valueAsNumber: ",
        e.target.valueAsNumber
      );
    }
    // }
    setError(false);
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
  };

  const handleFocus = (e, metricName, caseIndex) => {
    // const val = e.target.value;
    // const val = e.target.valueAsNumber;

    console.log("focused value we set: ", e.target.value);
    setFocusedValue(e.target.value);
  };

  const ebitBear = useSelector((state) =>
    computeEBIT(
      //extract only state for qfs symbol of interest
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      0
    )
  );
  const ebitBase = useSelector((state) =>
    computeEBIT(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );
  const ebitBull = useSelector((state) =>
    computeEBIT(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      2
    )
  );

  const adjIncBear = useSelector((state) =>
    computeAdjustedIncome(
      //extract only state for qfs symbol of interest
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      0
    )
  );
  const adjIncBase = useSelector((state) =>
    computeAdjustedIncome(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );
  const adjIncBull = useSelector((state) =>
    computeAdjustedIncome(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      2
    )
  );

  const susNopatBear = useSelector((state) =>
    computeNOPAT(
      //extract only state for qfs symbol of interest
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      0
    )
  );
  const susNopatBase = useSelector((state) =>
    computeNOPAT(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );
  const susNopatBull = useSelector((state) =>
    computeNOPAT(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      2
    )
  );

  const epvOpBusinessBear = useSelector((state) =>
    computeEPVOpBusiness(
      //extract only state for qfs symbol of interest
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      0
    )
  );
  const epvOpBusinessBase = useSelector((state) =>
    computeEPVOpBusiness(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );
  const epvOpBusinessBull = useSelector((state) =>
    computeEPVOpBusiness(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      2
    )
  );

  const epvPerShareBear = useSelector((state) =>
    computeEpvPerShare(
      //extract only state for qfs symbol of interest
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      0
    )
  );
  const epvPerShareBase = useSelector((state) =>
    computeEpvPerShare(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );
  const epvPerShareBull = useSelector((state) =>
    computeEpvPerShare(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      2
    )
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        borderRadius: "16px",
        marginTop: "12px",
      }}
      className="custom-mui-table"
      //   sx={{
      //     // backgroundColor: "rgba(255, 255, 255, 0.6)",
      //     backgroundColor: "transparent",
      //     boxShadow: "0 8px 32px 0 rgba(79, 70, 229, 0.1)",
      //     backdropFilter: "blur(12px)",
      //       }}
    >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
        <TableHead className="custom-table-head">
          <TableRow>
            <TableCell></TableCell>
            {columns.map((column) => {
              return <TableCell align="right">{column}</TableCell>;
            })}
            {/* <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody
        //   sx={{
        //     backgroundColor: "rgba(255, 255, 255, 0.6)", // translucent white
        //           }}
        >
          {data?.map((row) => {
            const metricName = Object.keys(row)[0];
            var [bear, base, bull] = row[metricName];

            //check for derived quantities
            switch (metricName) {
              case "EBIT":
                bear = ebitBear.toFixed(2);
                base = ebitBase.toFixed(2);
                bull = ebitBull.toFixed(2);
                break;
              case "Adjusted Income":
                bear = adjIncBear.toFixed(2);
                base = adjIncBase.toFixed(2);
                bull = adjIncBull.toFixed(2);
                break;
              case "Sustainable NOPAT":
                bear = susNopatBear.toFixed(2);
                base = susNopatBase.toFixed(2);
                bull = susNopatBull.toFixed(2);
                break;
              case "EPV operating business":
                bear = epvOpBusinessBear.toFixed(2);
                base = epvOpBusinessBase.toFixed(2);
                bull = epvOpBusinessBull.toFixed(2);
                break;
              case "EPV per share":
                bear = epvPerShareBear.toFixed(2);
                base = epvPerShareBase.toFixed(2);
                bull = epvPerShareBull.toFixed(2);
                break;
            }

            return (
              <EPVBodyTableRow
                metricName={metricName}
                bear={bear}
                bull={bull}
                base={base}
                qfsSymbol={qfsSymbol}
                isDerived={row.isDerived}
                hasData={row.hasData}
                ts={row.ts} //stores time series data of this quantity
                description={row.description}
              />
            );
            //   return (
            //     <TableRow
            //       className="custom-table-row-valuation"
            //       sx={{
            //         "&:last-child td, &:last-child th": { border: 0 },
            //       }}>
            //       <TableCell component="th" scope="row">
            //         {metricName}
            //       </TableCell>
            //       <TableCell align="right">
            //         {/* <Tooltip
            //           placement="right-start"
            //           arrow
            //           open={isNaN(Number(bear)) ? true : true}
            //           title="Invalid number"> */}
            //         <div>
            //           <OutlinedInput
            //             type="number"
            //             value={bear}
            //             onFocus={(e) => handleFocus(e, metricName, 0)}
            //             onBlur={(e) => handleBlur(e, metricName, 0)}
            //             // onBlur={(e) => handleChange(e, metricName, 0)}
            //             // onBlur={setError(false)}
            //             size="small"
            //             className="custom-input-valuation-table"
            //             onChange={(e) => {
            //               console.log("this is number(bear): ", Number(bear));
            //               handleChange(e, metricName, 0);
            //             }}
            //           />
            //         </div>
            //         {/* </Tooltip> */}
            //       </TableCell>
            //       <TableCell align="right">
            //         {/* <Tooltip
            //           placement="right-start"
            //           arrow

            //           title="Only numeric values are allowed"> */}
            //         <OutlinedInput
            //           type="number"
            //           value={base}
            //           size="small"
            //           onBlur={(e) => handleBlur(e, metricName, 1)}
            //           // onBlur={(e) => handleChange(e, metricName, 1)}
            //           className="custom-input-valuation-table"
            //           onChange={(e) => handleChange(e, metricName, 1)}
            //         />
            //         {/* </Tooltip> */}
            //       </TableCell>
            //       <TableCell align="right">
            //         {/* <Tooltip
            //           placement="right-start"
            //           arrow

            //           title="Only numeric values are allowed"> */}
            //         <OutlinedInput
            //           type="number"
            //           value={bull}
            //           size="small"
            //           className="custom-input-valuation-table"
            //           // onBlur={(e) => handleChange(e, metricName, 1)}
            //           onChange={(e) => handleChange(e, metricName, 2)}
            //         />
            //         {/* </Tooltip> */}
            //       </TableCell>
            //     </TableRow>
            //   );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AccordionBodyEpv;
