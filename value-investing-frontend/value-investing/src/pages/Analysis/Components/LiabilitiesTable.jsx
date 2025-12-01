import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AssetValCollapsableHeader from "../../valuation/components/AssetValCollapsableHeader";
import { useDispatch, useSelector } from "react-redux";
import {
  computeSumBalanceSheet,
  computeTotalLiabilities,
  sumBalanceSheetItems,
} from "../../valuation/components/selectorFunctions";
import AssetValLineItem from "../../valuation/components/AssetValLineItem";
import {
  updateLiquidationValuationData,
  updateLiqValMultChange,
} from "../../../features/analysisSlice";
import { computeTotLiab } from "./selectorFunctions";

function LiabilitiesTable({ qfsSymbol, tableColumnWidths, scaling }) {
  const [openLiab, setOpenLiab] = useState(true);
  const [openCurrentLiab, setOpenCurrentLiab] = useState(false);
  const [openNonCurrentLiab, setOpenNonCurrentLiab] = useState(false);
  const balanceSheet = useSelector((state) => state.analysis.balanceSheet);

  const dispatch = useDispatch();

  const handleLiabilityClick = () => {
    //if total assets are closed also close current assets
    if (openCurrentLiab) {
      setOpenCurrentLiab(false);
    }

    //if total assets are closed also close non-current assets
    if (openNonCurrentLiab) {
      setOpenNonCurrentLiab(false);
    }
    setOpenLiab(!openLiab);
  };

  const handleCurrentLiabClick = () => {
    setOpenCurrentLiab(!openCurrentLiab);
  };

  const handleNonCurrentLiabClick = () => {
    setOpenNonCurrentLiab(!openNonCurrentLiab);
  };

  const totalCurrentLiabs = useSelector(
    (state) => sumBalanceSheetItems(state.analysis?.balanceSheet?.currentLiab)

    // computeSumBalanceSheet(
    //   state.valuation.assetValuations?.find(
    //     (item) => item.qfsSymbol === qfsSymbol
    //   ),
    //   "currentLiab"
    // )
  );

  const totalNonCurrentLiabs = useSelector(
    (state) =>
      sumBalanceSheetItems(state.analysis?.balanceSheet?.nonCurrentLiab)
    // computeSumBalanceSheet(
    //   state.valuation.assetValuations?.find(
    //     (item) => item.qfsSymbol === qfsSymbol
    //   ),
    //   "nonCurrentLiab"
    // )
  );

  const totalLiabilities = useSelector((state) =>
    computeTotLiab(state.analysis?.balanceSheet)
  );

  const handleMetricChange = (e, category, metric) => {
    const newValue = e.target.value;

    console.log("metric change asset val: qfsSymbol: ", qfsSymbol);
    console.log("metric change asset val: category: ", category);
    console.log("metric change asset val: metric: ", metric);
    console.log("metric change asset val: newValue: ", newValue);

    dispatch(
      updateLiquidationValuationData(category, metric, newValue * scaling)
    );
  };

  const handleMultiplierChange = (e, category, metric) => {
    const newValue = e.target.value;

    console.log("metric change asset val: qfsSymbol: ", qfsSymbol);
    console.log("metric change asset val: category: ", category);
    console.log("metric change asset val: metric: ", metric);
    console.log("metric change asset val: newValue: ", newValue);

    dispatch(updateLiqValMultChange({ category, metric, newValue }));
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        borderRadius: "16px",
        marginTop: "12px",
        height: "fit-content",
      }}
      className="custom-mui-table">
      {" "}
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
          </TableRow>
        </TableHead>
        <TableBody>
          <AssetValCollapsableHeader
            label="Liabilities"
            columnWidths={tableColumnWidths}
            handleClick={handleLiabilityClick}
            open={openLiab}
            openCollapse={true} //highest level cannot be collapsed
            hasCellPadding={true}
            marginLeft=""
            titleType="big"
            value={(totalLiabilities / scaling).toFixed(0)}
          />
          <AssetValCollapsableHeader
            label="Current Liabilities"
            columnWidths={tableColumnWidths}
            handleClick={handleCurrentLiabClick}
            open={openCurrentLiab}
            openCollapse={openLiab}
            hasCellPadding={openLiab ? true : false}
            marginLeft="10px"
            value={(totalCurrentLiabs / scaling).toFixed(0)}
          />
          {balanceSheet?.currentLiab?.map((lineItem) => {
            return (
              <AssetValLineItem
                handleChange={handleMetricChange}
                key={lineItem.metric}
                multiplier={lineItem.multiplier}
                open={openCurrentLiab}
                handleMultiplierChange={handleMultiplierChange}
                label={lineItem.label}
                value={lineItem.value}
                category="currentLiab"
                metric={lineItem.metric}
                scaling={scaling}
              />
            );
          })}
          <AssetValCollapsableHeader
            label="Non-Current Liabilities"
            columnWidths={tableColumnWidths}
            handleClick={handleNonCurrentLiabClick}
            open={openNonCurrentLiab}
            openCollapse={openLiab}
            hasCellPadding={openLiab ? true : false}
            marginLeft="10px"
            value={(totalNonCurrentLiabs / scaling).toFixed(0)}
          />
          {balanceSheet?.currentLiab?.map((lineItem) => {
            return (
              <AssetValLineItem
                handleChange={handleMetricChange}
                key={lineItem.metric}
                multiplier={lineItem.multiplier}
                open={openNonCurrentLiab}
                handleMultiplierChange={handleMultiplierChange}
                label={lineItem.label}
                value={lineItem.value}
                category="nonCurrentLiab"
                metric={lineItem.metric}
                scaling={scaling}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LiabilitiesTable;
