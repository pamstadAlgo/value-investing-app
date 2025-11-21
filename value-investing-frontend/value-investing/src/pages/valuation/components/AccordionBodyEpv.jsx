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

const columns = ["Bear Case", "Base Case", "Bull Case"];

function AccordionBodyEpv({ data, qfsSymbol }) {
  const [value, setValue] = useState("");
  // const [data, setData] = useState(exampleData);
  const [focusedValue, setFocusedValue] = useState("");
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

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
      className="custom-mui-table">
      <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
        <TableHead className="custom-table-head">
          <TableRow>
            <TableCell></TableCell>
            {columns.map((column) => {
              return <TableCell align="right">{column}</TableCell>;
            })}
          </TableRow>
        </TableHead>
        <TableBody>
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
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AccordionBodyEpv;
