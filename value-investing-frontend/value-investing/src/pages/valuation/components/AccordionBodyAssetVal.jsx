import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";

function AccordionBodyAssetVal() {
  const [openAsset, setOpenAssets] = useState(false);
  const [openCurrentAsset, setOpenCurrentAsset] = useState(true);
  const [openNonCurrentAssets, setOpenNonCurrentAssets] = useState(true);

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
            <TableCell>205-06-12</TableCell>
            <TableCell>Multiplier</TableCell>
            <TableCell>Value</TableCell>

            {/* {columns.map((column) => {
              return <TableCell align="right">{column}</TableCell>;
            })} */}
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
          <TableRow>
            <TableCell>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpenAssets(!openAsset)}>
                {openAsset ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </IconButton>
              <span>Assets</span>
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell align="left">100'000</TableCell>
          </TableRow>
          {/* collapsable section of assets */}
          {/* {openAsset && ( */}
          {/* <TableRow className={`fade-row ${openAsset ? "open" : ""}`}> */}
          <TableRow className={`custom-table-row ${openAsset ? "open" : ""}`}>
            {/* <Collapse in={openAsset} timeout="auto" unmountOnExit> */}
            <TableCell
              className={`custom-cell ${openAsset ? "" : "no-padding-cell"}`}>
              {/* <Collapse in={openAsset} timeout="auto" unmountOnExit> */}
              <div>
                <IconButton
                  style={{ marginLeft: "32px" }}
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpenCurrentAsset(!openCurrentAsset)}>
                  {openCurrentAsset ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </IconButton>
                <span>Current Assets</span>
              </div>
              {/* </Collapse> */}
            </TableCell>
            {/* <TableCell></TableCell>
            <TableCell></TableCell> */}
            <TableCell
              align="left"
              className={`custom-cell ${openAsset ? "" : "no-padding-cell"}`}>
              {" "}
              {/* <Collapse in={openAsset} timeout="auto" unmountOnExit> */}
              <div>30'000</div>
              {/* </Collapse> */}
            </TableCell>
            {/* </Collapse> */}
          </TableRow>
          {/* )} */}
          {/* <TableRow>
            <Collapse in={openAsset} timeout="auto" unmountOnExit>
              <TableCell>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() =>
                    setOpenNonCurrentAssets(!openNonCurrentAssets)
                  }>
                  {openNonCurrentAssets ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </IconButton>
                <span>Non-Current Assets</span>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="left">70'000</TableCell>
            </Collapse>
          </TableRow> */}
          {/* {data?.map((row) => {
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
          })} */}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AccordionBodyAssetVal;
