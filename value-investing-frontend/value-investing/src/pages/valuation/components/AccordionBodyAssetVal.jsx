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
import { OutlinedInput } from "@mui/material";
import AssetValCollapsableHeader from "./AssetValCollapsableHeader";
import AssetValLineItem from "./AssetValLineItem";
import { useDispatch } from "react-redux";
import { updateAssetValuationData } from "../../../features/valuationSlice";

const tableColumnWidths = ["30%", "25%", "20%", "25%"];

function AccordionBodyAssetVal({ data, reportingDate, qfsSymbol }) {
  const [openAsset, setOpenAssets] = useState(false);
  const [openCurrentAsset, setOpenCurrentAsset] = useState(false);
  const [openNonCurrentAssets, setOpenNonCurrentAssets] = useState(true);
  const dispatch = useDispatch();

  const handleAssetClick = () => {
    if (openCurrentAsset) {
      setOpenCurrentAsset(false);
    }
    setOpenAssets(!openAsset);
  };

  const handleCurrentAssetClick = () => {
    setOpenCurrentAsset(!openCurrentAsset);
  };

  const handleMetricChange = (e,  category, metric) => {
    const newValue = e.target.value;

    console.log("metric change asset val: qfsSymbol: ", qfsSymbol);
    console.log("metric change asset val: category: ", category);
    console.log("metric change asset val: metric: ", metric);
    console.log("metric change asset val: newValue: ", newValue);

    dispatch(
      updateAssetValuationData({ qfsSymbol, category, metric, newValue })
    );
  };

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
            <TableCell style={{ width: tableColumnWidths[0] }}></TableCell>
            <TableCell style={{ width: tableColumnWidths[1] }} align="right">
              2025-06-12
            </TableCell>
            <TableCell style={{ width: tableColumnWidths[2] }} align="right">
              Multiplier
            </TableCell>
            <TableCell style={{ width: tableColumnWidths[3] }} align="right">
              Value
            </TableCell>

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
          <AssetValCollapsableHeader
            label="Assets"
            columnWidths={tableColumnWidths}
            handleClick={handleAssetClick}
            open={openAsset}
            openCollapse={true} //highest level cannot be collapsed
            hasCellPadding={true}
            marginLeft=""
          />
          <AssetValCollapsableHeader
            label="Current Assets"
            columnWidths={tableColumnWidths}
            handleClick={handleCurrentAssetClick}
            open={openCurrentAsset}
            openCollapse={openAsset}
            hasCellPadding={openAsset ? true : false}
            marginLeft="10px"
          />
          {data?.currentAssets?.map((lineItem) => {
            return (
              <AssetValLineItem
                handleChange={handleMetricChange}
                key={lineItem.metric}
                open={openCurrentAsset}
                label={lineItem.label}
                value={lineItem.value}
                category="currentAssets"
                metric={lineItem.metric}
              />
            );
          })}

          {/* <AssetValLineItem open={openCurrentAsset} label="Cash & Equivalent" />
          <AssetValLineItem
            open={openCurrentAsset}
            label="Short-Term Investments"
          /> */}

          {/* <TableRow>
            <TableCell style={{ width: tableColumnWidths[0] }}>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => {
                  //make sure that also current and non-current items are no longer visible
                  if (openCurrentAsset) {
                    setOpenCurrentAsset(false);
                  }
                  setOpenAssets(!openAsset);
                }}>
                {openAsset ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </IconButton>
              <span>Assets</span>
            </TableCell>
            <TableCell style={{ width: tableColumnWidths[1] }}></TableCell>
            <TableCell style={{ width: tableColumnWidths[2] }}></TableCell>
            <TableCell style={{ width: tableColumnWidths[3] }} align="right">
              100'000
            </TableCell>
          </TableRow> */}
          {/* <TableRow className={`custom-table-row ${openAsset ? "open" : ""}`}>
            <TableCell
              className={`custom-cell ${openAsset ? "" : "no-padding-cell"}`}>
              <Collapse in={openAsset} timeout="auto" unmountOnExit>
                <IconButton
                  style={{ marginLeft: "10px" }}
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
              </Collapse>
            </TableCell>
            <TableCell
              className={`custom-cell ${openAsset ? "" : "no-padding-cell"}`}>
              {" "}
            </TableCell>
            <TableCell
              className={`custom-cell ${
                openAsset ? "" : "no-padding-cell"
              }`}></TableCell>
            <TableCell
              align="right"
              className={`custom-cell ${openAsset ? "" : "no-padding-cell"}`}>
              {" "}
              <Collapse in={openAsset} timeout="auto" unmountOnExit>
                30'000{" "}
              </Collapse>
            </TableCell>
          </TableRow> */}
          {/* <TableRow
            className={`custom-table-row ${openCurrentAsset ? "open" : ""}`}>
            <TableCell
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                <span style={{ marginLeft: "54px" }}>Cash & Equivalents</span>
              </Collapse>
            </TableCell>
            <TableCell
              align="right"
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                <OutlinedInput
                  // disabled={isDerived}
                  type="number"
                  // value={bull}
                  size="small"
                  className="custom-input-valuation-table"
                  // onBlur={(e) => handleChange(e, metricName, 1)}
                  // onChange={(e) => handleChange(e, metricName, 2)}
                />
              </Collapse>
            </TableCell>
            <TableCell
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                <OutlinedInput
                  // disabled={isDerived}
                  type="number"
                  // value={bull}
                  size="small"
                  className="custom-input-valuation-table"
                  // onBlur={(e) => handleChange(e, metricName, 1)}
                  // onChange={(e) => handleChange(e, metricName, 2)}
                />
              </Collapse>
            </TableCell>
            <TableCell
              align="right"
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              {" "}
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                10'000{" "}
              </Collapse>
            </TableCell>
          </TableRow> */}
          {/* <TableRow
            className={`custom-table-row ${openCurrentAsset ? "open" : ""}`}>
            <TableCell
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                <span style={{ marginLeft: "54px" }}>
                  Short-Term Investments
                </span>
              </Collapse>
            </TableCell>
            <TableCell
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              {" "}
            </TableCell>
            <TableCell
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}></TableCell>
            <TableCell
              align="right"
              className={`custom-cell ${
                openCurrentAsset ? "" : "no-padding-cell"
              }`}>
              {" "}
              <Collapse in={openCurrentAsset} timeout="auto" unmountOnExit>
                10'000{" "}
              </Collapse>
            </TableCell>
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
