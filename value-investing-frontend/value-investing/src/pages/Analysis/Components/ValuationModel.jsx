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
import ValuationInputCell from "./ValuationInputCell";

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

  // Compute VALUATION DRIVERS
  const rnoa = [0, 0, 0];
  const assetTurnover = [0, 0, 0];
  const profitMargin = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    const revenue = valuationData?.revenue?.[i] || 0;
    const noa = netOpAssets[i] || 0;
    const pat = nopat[i] || 0;

    rnoa[i] = noa !== 0 ? pat / noa : 0;
    assetTurnover[i] = noa !== 0 ? revenue / noa : 0;
    profitMargin[i] = revenue !== 0 ? pat / revenue : 0;
  }

  const formatPercentage = (val) => {
    return (val * 100).toFixed(1) + "%";
  };

  const formatWithThousandSeparator = (val) => {
    if (val === undefined || val === null) return "";
    // Convert to string and add ' as thousand separator
    // standard regex for thousand separator
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const cleanNumberString = (str) => {
    // Remove ' and replace , with . if needed for parsing, though JS uses . for decimals.
    // User asked for "numpads '.' as a comma". In many EU standard . is thousands, , is decimal.
    // But prompt says "numbers: 21'000", implying ' is thousands.
    // "numpads '.' as a comma" might mean they want to type ',' for decimal using numpad '.'?
    // Or they want to use '.' as decimal but numpad sends '.' and they want ','?
    // Usually numpad sends Locale dependent char.
    // Let's assume standard JS float parsing needs '.'
    // So custom handling: convert ',' -> '.' for parsing if user types comma.
    // Remove '
    return str.replace(/'/g, "").replace(/,/g, ".");
  };



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
        lastClosePrice={data?.lastClosePrice}
        headerAction={<ValuationApproachSelect />}
      >
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
            <TableHead sx={{ backgroundColor: "var(--background-color)" }}>
              <TableRow>
                <TableCell sx={{ color: "var(--text-color-grey-scale)", fontWeight: "bold", borderBottom: "none" }}>LINE ITEM</TableCell>
                {companyData?.periods?.map((period) => {
                  return <TableCell key={period} sx={{ color: "var(--text-color-grey-scale)", borderBottom: "none" }}>{period}</TableCell>;
                })}
                {valuationCases?.map((item) => {
                  return <TableCell key={item} align="left" sx={{ color: "var(--action-color)", fontWeight: "bold", borderBottom: "none" }}>{item.toUpperCase()}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  className="valuation-model-title-row"
                  colSpan={10}
                  style={{ padding: "10px 16px" }}>
                  <div className="flex-box-wrapper-table-header-val-model" style={{ color: "#B0B0B0", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                    <span>NOPAT DERIVATION</span>

                  </div>
                </TableCell>
              </TableRow>
              {[
                "revenue",
                "cogs",
                "gross_profit",
                "gross_margin",
                "sga",
                "rnd",
                "other_opex",
                "operating_income",
                "op_margins",
                "income_tax",
                "eff_tax_rate",
                "NOPAT",
              ]
                .filter((key) => {
                  const nopats = companyData?.metricsNopat || {};
                  return nopats.hasOwnProperty(key) || ["gross_margin", "gross_profit"].includes(key) || key === "NOPAT";
                })
                .map((metricName) => {
                  const nopats = companyData?.metricsNopat || {};
                  let values = nopats[metricName];

                  if (metricName === "gross_margin" || metricName === "gross_profit") {
                    const revValues = nopats["revenue"]?.values || {};
                    const cogsValues = nopats["cogs"]?.values || {};
                    const periods = companyData?.periods || [];
                    const calculatedValues = {};
                    const tsData = [];

                    periods.forEach(p => {
                      const r = revValues[p];
                      const c = cogsValues[p];

                      if (metricName === "gross_margin") {
                        if (r && c !== undefined && r !== 0) {
                          const val = (r - c) / r;
                          calculatedValues[p] = val;
                          tsData.push({ x: p, y: val });
                        } else {
                          calculatedValues[p] = "-";
                        }
                      } else {
                        // gross_profit
                        if (r !== undefined && c !== undefined) {
                          const val = r - c;
                          calculatedValues[p] = val;
                          tsData.push({ x: p, y: val });
                        } else {
                          calculatedValues[p] = "-";
                        }
                      }
                    });

                    values = {
                      values: calculatedValues,
                      type: metricName === "gross_margin" ? "ratio" : "currency",
                      hasTs: true,
                      ts: tsData
                    };
                  }

                  if (!values) return null;

                  let style = {};
                  let isPercentage = false;

                  if (metricName === "Gross Profit" || metricName === "gross_profit") {
                    style = { fontStyle: "italic", fontWeight: "bold", color: "var(--valuation-table-cell-font-color)" };
                  }
                  if (metricName === "operating_income" || metricName === "Op. Income") {
                    style = { fontStyle: "italic", fontWeight: "bold", color: "var(--valuation-table-cell-font-color)" };
                  }
                  if (metricName === "NOPAT") {
                    style = { color: "var(--action-color)", fontWeight: "bold" };
                  }
                  // New Gross Margin Styling
                  if (metricName === "gross_margin") {
                    style = { fontStyle: "italic", color: "var(--text-color-grey-scale)" };
                    isPercentage = true;
                  }
                  // Op Margins Styling (Historicals)
                  if (metricName === "op_margins") {
                    style = { fontStyle: "italic", color: "var(--text-color-grey-scale)" };
                    isPercentage = true;
                  }

                  if (["op_margins", "eff_tax_rate"].includes(metricName)) {
                    isPercentage = true;
                  }

                  const cellStyle = { borderBottom: "none", ...style };

                  return (
                    <TableRow key={metricName}>
                      <TableCell sx={{ borderBottom: "none" }}>
                        <div className="flexbox-wrapper-table-cell-analysis" style={style}>
                          {metricName === "operating_income" ? "Op. Income" : metricName === "gross_margin" ? "Gross Margin" : metricName}
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

                        if (values?.type !== "ratio" && cellValue !== "-") {
                          cellValue = (cellValue / scaling).toFixed(0);
                        }

                        if (isPercentage && cellValue !== "-") {
                          // Strip existing % if any to avoid double %
                          let val = parseFloat(cellValue);

                          // Fix for negative tax rate display
                          if (metricName === "eff_tax_rate") {
                            val = Math.abs(val);
                          }

                          if (!isNaN(val)) cellValue = (val * 100).toFixed(1) + "%";
                        } else if (values?.type !== "ratio" && cellValue !== "-") {
                          let [intPart, decPart] = cellValue.toString().split(".");
                          intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
                          cellValue = decPart ? `${intPart}.${decPart}` : intPart;
                        }

                        return <TableCell key={period} style={cellStyle}>{cellValue}</TableCell>;
                      })}
                      {valuationCases.map((valuationCase, index) => {
                        let isEditable = false;
                        if (valuationApproach === "topDown") {
                          isEditable = topDownEditableFields.includes(metricName);
                        } else {
                          isEditable = bottomUpEditableFields.includes(metricName);
                        }

                        let scaleFactor = values?.type !== "ratio" ? scaling : 1;
                        let value = valuationData[metricName]?.[index];

                        switch (metricName) {
                          case "operating_income":
                          case "Op. Income":
                            value = opIncome[index];
                            break;
                          case "NOPAT":
                            value = nopat[index];
                            break;
                          case "op_margins":
                            if (valuationApproach === "bottomUp") {
                              value = opMargins[index];
                            }
                            break;
                          case "income_tax":
                            value = opIncome[index] * taxRate;
                            style = { ...style, color: "var(--valuation-table-cell-font-color)" };
                            break;
                          case "eff_tax_rate":
                            value = taxRate;
                            style = { ...style, color: "var(--valuation-table-cell-font-color)" };
                            break;
                          case "gross_profit":
                          case "Gross Profit": {
                            const revenue = valuationData["revenue"]?.[index] || 0;
                            const cogs = valuationData["cogs"]?.[index] || 0;
                            value = revenue - cogs;
                            break;
                          }
                          case "gross_margin": {
                            const revenue = valuationData["revenue"]?.[index] || 0;
                            const gp = (valuationData["revenue"]?.[index] || 0) - (valuationData["cogs"]?.[index] || 0);
                            value = revenue !== 0 ? gp / revenue : 0;
                            break;
                          }
                        }

                        if (values?.type !== "ratio" && metricName !== "gross_margin") {
                          value = (value / scaleFactor).toFixed(0);
                        }

                        if (valuationApproach === "topDown" && ["sga", "rnd", "other_opex", "cogs", "gross_profit", "Gross Profit"].includes(metricName)) {
                          value = "";
                          style = { ...style, color: "var(--disabled-valuation-fields-color)" };
                        }
                        if (valuationApproach === "bottomUp" && metricName === "op_margins") {
                          style = { ...style, color: "var(--text-color-grey-scale)", fontStyle: "italic" };
                        }

                        const isPercentInput = ["op_margins", "eff_tax_rate", "gross_margin"].includes(metricName);

                        return (
                          <TableCell key={index} sx={{ borderBottom: "none" }}>
                            <ValuationInputCell
                              value={value}
                              onSave={(val, mName, idx, sFactor) => {
                                handleValuationChange({ target: { value: val } }, mName, idx, sFactor);
                              }}
                              metricName={metricName}
                              index={index}
                              scaleFactor={scaleFactor}
                              isEditable={isEditable}
                              isPercentInput={isPercentInput}
                              style={{ color: "var(--action-color)", ...style }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              <TableRow>
                <TableCell className="valuation-model-title-row" colSpan={10} style={{ padding: "10px 16px" }}>
                  <div className="flex-box-wrapper-table-header-val-model" style={{ color: "#B0B0B0", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                    <span>INVESTED CAPITAL (NOA)</span>
                  </div>
                </TableCell>
              </TableRow>
              {Object.entries(companyData?.metricsNoa || {}).map(
                ([metricName, values]) => {
                  return (
                    <TableRow key={metricName}>
                      <TableCell sx={{ borderBottom: "none" }}>
                        <div className="flexbox-wrapper-table-cell-analysis" style={
                          (metricName === "netOperatingAssets" || metricName === "NOA")
                            ? { fontWeight: "bold", fontStyle: "italic", color: "var(--valuation-table-cell-font-color)" }
                            : {}
                        }>
                          {metricName}
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

                        if (values?.type !== "ratio" && cellValue !== "-") {
                          cellValue = (cellValue / scaling).toFixed(0);
                          // Apply thousand separator
                          let [intPart, decPart] = cellValue.toString().split(".");
                          intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
                          cellValue = decPart ? `${intPart}.${decPart}` : intPart;
                        }
                        return <TableCell key={period} sx={{ borderBottom: "none" }}>{cellValue}</TableCell>;
                      })}
                      {valuationCases.map((valuationCase, index) => {
                        let isEditable = editableFieldsCapitalStructure.includes(metricName);

                        let scaleFactor = values.type !== "ratio" ? scaling : 1;
                        let value = valuationData[metricName]?.[index];

                        switch (metricName) {
                          case "netOperatingAssets":
                            value = netOpAssets[index];
                            break;
                        }

                        if (values.type !== "ratio") {
                          value = (value / scaleFactor).toFixed(0);
                        }

                        let style = {};
                        if (metricName === "netOperatingAssets" || metricName === "NOA") {
                          style = { ...style, color: "var(--valuation-table-cell-font-color)" };
                        }

                        return (
                          <TableCell key={index} sx={{ borderBottom: "none" }}>
                            <ValuationInputCell
                              value={value}
                              onSave={(val, mName, idx, sFactor) => {
                                handleValuationChange({ target: { value: val } }, mName, idx, sFactor);
                              }}
                              metricName={metricName}
                              index={index}
                              scaleFactor={scaleFactor}
                              isEditable={isEditable}
                              isPercentInput={false}
                              style={{ color: "var(--action-color)", ...style }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }
              )}
              {/* VALUATION DRIVERS SECTION */}
              <TableRow>
                <TableCell className="valuation-model-title-row" colSpan={10} style={{ padding: "10px 16px" }}>
                  <div className="flex-box-wrapper-table-header-val-model" style={{ color: "#B0B0B0", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                    <span>VALUATION DRIVERS</span>
                  </div>
                </TableCell>
              </TableRow>

              {/* RNOA Row */}
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <div className="flexbox-wrapper-table-cell-analysis" style={{ color: "#00E5FF", fontWeight: "bold" }}>
                    RNOA %
                  </div>
                </TableCell>
                {/* Historical RNOA */}
                {companyData?.periods?.map((period) => {
                  const nopatVal = companyData?.metricsNopat?.["NOPAT"]?.values?.[period];
                  const noaVal = companyData?.metricsNoa?.["netOperatingAssets"]?.values?.[period];
                  let rnoaHist = "-";
                  if (nopatVal !== undefined && noaVal && noaVal !== 0) {
                    rnoaHist = (nopatVal / noaVal * 100).toFixed(1) + "%";
                  }
                  return <TableCell key={period} sx={{ borderBottom: "none" }}>{rnoaHist}</TableCell>;
                })}
                {valuationCases.map((_, index) => (
                  <TableCell key={index} sx={{ borderBottom: "none" }}>
                    <div className="custom-input-valuation-table" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '14px', color: "#00E5FF", fontWeight: "bold" }}>
                      {formatPercentage(rnoa[index])}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Asset Turnover Row */}
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <div className="flexbox-wrapper-table-cell-analysis">
                    Asset Turnover
                  </div>
                </TableCell>
                {/* Historical Asset Turnover */}
                {companyData?.periods?.map((period) => {
                  const revVal = companyData?.metricsNopat?.["revenue"]?.values?.[period];
                  const noaVal = companyData?.metricsNoa?.["netOperatingAssets"]?.values?.[period];
                  let atHist = "-";
                  if (revVal !== undefined && noaVal && noaVal !== 0) {
                    atHist = (revVal / noaVal).toFixed(2) + "x";
                  }
                  return <TableCell key={period} sx={{ borderBottom: "none" }}>{atHist}</TableCell>;
                })}
                {valuationCases.map((_, index) => (
                  <TableCell key={index} sx={{ borderBottom: "none" }}>
                    <div className="custom-input-valuation-table" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '14px' }}>
                      {assetTurnover[index].toFixed(2)}x
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Profit Margin Row */}
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <div className="flexbox-wrapper-table-cell-analysis">
                    Profit Margin
                  </div>
                </TableCell>
                {/* Historical Profit Margin */}
                {companyData?.periods?.map((period) => {
                  const nopatVal = companyData?.metricsNopat?.["NOPAT"]?.values?.[period];
                  const revVal = companyData?.metricsNopat?.["revenue"]?.values?.[period];
                  let pmHist = "-";
                  if (nopatVal !== undefined && revVal && revVal !== 0) {
                    pmHist = (nopatVal / revVal * 100).toFixed(1) + "%";
                  }
                  return <TableCell key={period} sx={{ borderBottom: "none" }}>{pmHist}</TableCell>;
                })}
                {valuationCases.map((_, index) => (
                  <TableCell key={index} sx={{ borderBottom: "none" }}>
                    <div className="custom-input-valuation-table" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '14px' }}>
                      {formatPercentage(profitMargin[index])}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      </GlassCardWrapper >
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
