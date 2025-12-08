import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useDispatch, useSelector } from "react-redux";
import ToggleButtonsScaling from "./ToggleButtonsScaling";
import { OutlinedInput } from "@mui/material";
import ValuationApproachSelect from "./ValuationApproachSelect";
import Tooltip from "@mui/material/Tooltip";
import { updateValuationData } from "../../../features/analysisSlice";
import {
  computeEquityVal,
  computeNetOpAssets,
  computeNopatBottomUp,
  computeNopatTopDown,
  computeOpIncomeBottomUp,
  computeOpIncomeTopDown,
  computeOpMarginBottomUp,
} from "./selectorFunctions";
import ValuationAssumptions from "./ValuationAssumptions";
import MetricGraph from "./MetricGraph";
import ValuationSummary from "./ValuationSummary";
import { useLastClosePrice } from "../../valuation/components/AccordionTitle";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import LiquidationValue from "./LiquidationValue";
import GlassCardWrapper from "./GlassCardWrapper";
import SaveValuationModal from "./SaveValuationModal";
import ValuationActionToolbar from "./ValuationActionToolbar";

const valuationCases = ["Bear", "Base", "Bull"];
const topDownEditableFields = ["revenue", "op_margins"];
const bottomUpEditableFields = ["revenue", "cogs", "sga", "rnd", "other_opex"];
const editableFieldsCapitalStructure = [
  "operatingAssets",
  "operatingLiabilities",
  "bookValue",
];

function ValuationModel({ qfsSymbol, onToggleHistory, isHistoryOpen }) {
  const companyData = useSelector((state) => state.analysis?.companyData);
  const valuationApproach = useSelector(
    (state) => state.analysis?.valuationApproach
  );
  const axiosInstanceAuth = useAxiosWithAuth();

  const valuationData = useSelector((state) => state.analysis?.valuationData);
  const taxRate = useSelector((state) => state.analysis?.taxRate);
  const wacc = useSelector((state) => state.analysis?.wacc);
  const g = useSelector((state) => state.analysis?.terminalGrowthRate);
  const nrShares = useSelector(
    (state) => state.analysis?.companyData?.nrShares
  );
  const { data, isLoading } = useLastClosePrice(qfsSymbol, axiosInstanceAuth);

  const currencyCode = useSelector(
    (state) => state.analysis?.companyData?.currency
  );

  const [scaling, setScaling] = useState("1000000");
  const [scalingBalanceSheet, setScalingBalanceSheet] = useState("1000000");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const dispatch = useDispatch();

  const handleToggleButtonChange = (e, newValue) => {
    // null check enforces that always one value is selected
    if (newValue !== null) {
      setScaling(newValue);
    }
  };

  const handleScalingChangeBs = (e, newValue) => {
    // null check enforces that always one value is selected
    if (newValue !== null) {
      setScalingBalanceSheet(newValue);
    }
  };

  const handleValuationChange = (e, metricName, valuationCase, scaleFactor) => {
    dispatch(
      updateValuationData({
        newValue: e.target.value,
        metricName: metricName,
        caseIndex: valuationCase,
        scaleFactor: scaleFactor,
      })
    );
  };

  let opIncome = [0, 0, 0];
  let nopat = [0, 0, 0];
  let opMargins = [0, 0, 0];
  let equityVal = [0, 0, 0];
  let netOpAssets = [0, 0, 0];

  //   let opIncomeBear = null;
  //   let opIncomeBase = null;
  //   let opIncomeBull = null;

  if (valuationApproach === "topDown") {
    opIncome[0] = computeOpIncomeTopDown(valuationData, 0);
    opIncome[1] = computeOpIncomeTopDown(valuationData, 1);
    opIncome[2] = computeOpIncomeTopDown(valuationData, 2);

    nopat[0] = computeNopatTopDown(valuationData, taxRate, 0);
    nopat[1] = computeNopatTopDown(valuationData, taxRate, 1);
    nopat[2] = computeNopatTopDown(valuationData, taxRate, 2);
  } else if (valuationApproach === "bottomUp") {
    //bottomUp we need to compute OpIncome, OpMargin and nopat
    opIncome[0] = computeOpIncomeBottomUp(valuationData, 0);
    opIncome[1] = computeOpIncomeBottomUp(valuationData, 1);
    opIncome[2] = computeOpIncomeBottomUp(valuationData, 2);

    //compute op margin
    opMargins[0] = computeOpMarginBottomUp(valuationData, 0).toFixed(3);
    opMargins[1] = computeOpMarginBottomUp(valuationData, 1).toFixed(3);
    opMargins[2] = computeOpMarginBottomUp(valuationData, 2).toFixed(3);

    //compute NOPAT
    nopat[0] = computeNopatBottomUp(valuationData, taxRate, 0);
    nopat[1] = computeNopatBottomUp(valuationData, taxRate, 1);
    nopat[2] = computeNopatBottomUp(valuationData, taxRate, 2);
  }

  console.log("nopat before function: ", nopat);
  console.log("valuationData?.bookValue: ", valuationData?.bookValue);
  console.log(
    "valuationData?.netOperatingAssets: ",
    valuationData?.netOperatingAssets
  );

  //compute equity value
  equityVal[0] = computeEquityVal(
    valuationData?.bookValue,
    nopat,
    wacc,
    valuationData?.netOperatingAssets,
    g,
    0
  );
  equityVal[1] = computeEquityVal(
    valuationData?.bookValue,
    nopat,
    wacc,
    valuationData?.netOperatingAssets,
    g,
    1
  );
  equityVal[2] = computeEquityVal(
    valuationData?.bookValue,
    nopat,
    wacc,
    valuationData?.netOperatingAssets,
    g,
    2
  );

  //compute net operating assets
  netOpAssets[0] = computeNetOpAssets(valuationData, 0);
  netOpAssets[1] = computeNetOpAssets(valuationData, 1);
  netOpAssets[2] = computeNetOpAssets(valuationData, 2);

  console.log("equityVal that we pass: ", equityVal);
  console.log("nr shares: ", nrShares);

  return (
    <>
      <div className="valuation-model-grip-wrapper">
        <ValuationSummary
          equityVals={equityVal}
          currencyCode={currencyCode}
          lastClosePrice={data?.lastClosePrice}
          nrShares={nrShares}
          qfsSymbol={qfsSymbol}
        />
        <ValuationAssumptions scalingFactor={scaling} />
      </div>
      <ValuationActionToolbar
        scaling={scaling}
        onScalingChange={handleToggleButtonChange}
        onSave={() => setIsSaveModalOpen(true)}
        onToggleHistory={onToggleHistory}
        isHistoryOpen={isHistoryOpen}
      />
      {/* <div className="button-group-wrapper">
        <ToggleButtonsScaling
          value={scaling}
          handleChange={handleToggleButtonChange}
        />
      </div> */}
      <GlassCardWrapper
        title="Valuation Model"
        currencyCode={currencyCode}
        qfsSymbol={qfsSymbol}
        lastClosePrice={data?.lastClosePrice}>
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            borderRadius: "20px",
            marginTop: "12px",
          }}
          className="custom-mui-table">
          {/* <div
            className="table-header-title"
            style={{ borderRadius: "20px 20px 0px 0px" }}>
            Valuation Model
          </div> */}
          <Table
            sx={{ minWidth: 650 }}
            size="small"
            aria-label="simple table"
            className="custom-table-analysis-page">
            <TableHead className="custom-table-head">
              <TableRow>
                <TableCell>Line Item</TableCell>
                {companyData?.periods?.map((period) => {
                  return <TableCell>{period}</TableCell>;
                })}
                {valuationCases?.map((item) => {
                  return <TableCell align="left">{item}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  className="valuation-model-title-row"
                  colSpan={10}
                  style={{ padding: "10px 16px" }}>
                  <div className="flex-box-wrapper-table-header-val-model">
                    <span> NOPAT Derivation</span>
                    <ValuationApproachSelect />
                  </div>
                </TableCell>
              </TableRow>
              {Object.entries(companyData?.metricsNopat).map(
                ([metricName, values]) => (
                  <TableRow key={metricName}>
                    <TableCell>
                      <div className="flexbox-wrapper-table-cell-analysis">
                        {metricName}
                        {/* display graph if time series data is available */}
                        {values.hasTs && (
                          <MetricGraph
                            data={values.ts}
                            metricName={metricName}
                          />
                        )}
                      </div>
                    </TableCell>
                    {companyData?.periods.map((period) => {
                      let cellValue = values?.values[period]
                        ? values?.values[period]
                        : "-";

                      //if value is not of type ratio we scale it
                      if (values?.type !== "ratio" && cellValue !== "-") {
                        cellValue = (cellValue / scaling).toFixed(0);
                      }
                      return <TableCell key={period}>{cellValue}</TableCell>;
                    })}
                    {valuationCases.map((valuationCase, index) => {
                      let isEditable = false;
                      if (valuationApproach === "topDown") {
                        isEditable = topDownEditableFields.includes(metricName);
                      } else {
                        isEditable =
                          bottomUpEditableFields.includes(metricName);
                      }

                      let scaleFactor = values.type !== "ratio" ? scaling : 1;

                      var value = valuationData[metricName]?.[index];

                      switch (metricName) {
                        case "operating_income":
                          // if (valuationApproach === "topDown") {
                          value = opIncome[index];
                          // }

                          break;
                        case "NOPAT":
                          value = nopat[index];
                          break;
                        case "op_margins":
                          //if valuation approach is topDown, op margin will be inpute by user; it bottomUp it will be computed
                          if (valuationApproach === "bottomUp") {
                            value = opMargins[index];
                          }
                          break;
                      }

                      if (metricName === "revenue") {
                        console.log("this is value: ", value);
                      }

                      //scale the value if the value is not a ratio
                      if (values.type !== "ratio") {
                        value = (value / scaleFactor).toFixed(0);
                      }

                      return (
                        <TableCell>
                          {/* <Tooltip
                          placement="right-start"
                          arrow
                          title="Change the valuation approach in order to edit this field"
                          // disableHoverListener={screenerState.activFilters?.length !== 0}
                          disableHoverListener={isEditable}
                          disableFocusListener={isEditable}
                          disableTouchListener={isEditable}> */}
                          <OutlinedInput
                            disabled={!isEditable}
                            onChange={(e) =>
                              handleValuationChange(
                                e,
                                metricName,
                                index,
                                scaleFactor
                              )
                            }
                            // onChange={(e) => handleChange(e, category, metric)}
                            type="number"
                            // value={valuationData[metricName]?.[index]}
                            value={value}
                            size="small"
                            // inputProps={{
                            //   style: { textAlign: "left" },
                            // }}
                            className="custom-input-valuation-table"
                          />
                          {/* </Tooltip> */}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )
              )}
              <TableRow>
                <TableCell className="valuation-model-title-row" colSpan={10}>
                  <div className="flex-box-wrapper-table-header-val-model">
                    <span>Invested Capital (NOA)</span>
                    {/* <ValuationApproachSelect /> */}
                  </div>
                </TableCell>
              </TableRow>
              {Object.entries(companyData?.metricsNoa).map(
                ([metricName, values]) => {
                  return (
                    <TableRow key={metricName}>
                      <TableCell>
                        <div className="flexbox-wrapper-table-cell-analysis">
                          {metricName}
                          {/* display graph if time series data is available */}
                          {values.hasTs && (
                            <MetricGraph
                              data={values.ts}
                              metricName={metricName}
                            />
                          )}
                        </div>
                      </TableCell>
                      {companyData?.periods.map((period) => {
                        let cellValue = values?.values[period]
                          ? values?.values[period]
                          : "-";

                        //if value is not of type ratio we scale it
                        if (values?.type !== "ratio" && cellValue !== "-") {
                          cellValue = (cellValue / scaling).toFixed(0);
                        }
                        return <TableCell key={period}>{cellValue}</TableCell>;
                      })}
                      {valuationCases.map((valuationCase, index) => {
                        let isEditable =
                          editableFieldsCapitalStructure.includes(metricName);
                        // if (valuationApproach === "topDown") {
                        //   isEditable = topDownEditableFields.includes(metricName);
                        // } else {
                        //   isEditable =
                        //     bottomUpEditableFields.includes(metricName);
                        // }

                        let scaleFactor = values.type !== "ratio" ? scaling : 1;

                        var value = valuationData[metricName]?.[index];

                        switch (metricName) {
                          case "netOperatingAssets":
                            // if (valuationApproach === "topDown") {
                            value = netOpAssets[index];
                            // }

                            break;
                        }

                        //scale the value if the value is not a ratio
                        if (values.type !== "ratio") {
                          value = (value / scaleFactor).toFixed(0);
                        }

                        return (
                          <TableCell>
                            {/* <Tooltip
                          placement="right-start"
                          arrow
                          title="Change the valuation approach in order to edit this field"
                          // disableHoverListener={screenerState.activFilters?.length !== 0}
                          disableHoverListener={isEditable}
                          disableFocusListener={isEditable}
                          disableTouchListener={isEditable}> */}
                            <OutlinedInput
                              disabled={!isEditable}
                              onChange={(e) =>
                                handleValuationChange(
                                  e,
                                  metricName,
                                  index,
                                  scaleFactor
                                )
                              }
                              // onChange={(e) => handleChange(e, category, metric)}
                              type="number"
                              // value={valuationData[metricName]?.[index]}
                              value={value}
                              size="small"
                              className="custom-input-valuation-table"
                            />
                            {/* </Tooltip> */}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCardWrapper>
      <LiquidationValue
        qfsSymbol={qfsSymbol}
        scaling={scalingBalanceSheet}
        handleToggleButtonChange={handleScalingChangeBs}
        currencyCode={currencyCode}
        lastClosePrice={data?.lastClosePrice}
        nrShares={nrShares}
      />

      <SaveValuationModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        qfsSymbol={qfsSymbol}
        equityVals={equityVal}
      />
    </>
  );
}

export default ValuationModel;
