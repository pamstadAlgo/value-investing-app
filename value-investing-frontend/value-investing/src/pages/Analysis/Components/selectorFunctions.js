// import { type } from "@testing-library/user-event/dist/type";
import {
  computeTotalLiabilities,
  sumBalanceSheetItems,
} from "../../valuation/components/selectorFunctions";

export function computeOpIncomeTopDown(data, caseIndex) {
  var opIncome = data?.revenue[caseIndex] * data?.op_margins[caseIndex];

  return opIncome;
}

export function computeOpIncomeBottomUp(data, caseIndex) {
  var opIncome =
    data?.revenue[caseIndex] -
    data?.cogs[caseIndex] -
    data?.sga[caseIndex] -
    data?.rnd[caseIndex] -
    data?.other_opex[caseIndex];

  return opIncome;
}

export function computeOpMarginBottomUp(data, caseIndex) {
  var opIncome = computeOpIncomeBottomUp(data, caseIndex);
  return opIncome / data?.revenue[caseIndex];
}

export function computeNopatTopDown(data, taxRate, caseIndex) {
  var nopat =
    data?.revenue[caseIndex] * data?.op_margins[caseIndex] * (1 - taxRate);

  return nopat;
}

export function computeNopatBottomUp(data, taxRate, caseIndex) {
  var opIncome = computeOpIncomeBottomUp(data, caseIndex);
  return opIncome * (1 - taxRate);
}

export function computeEquityVal(b0, nopat, wacc, noa, g, caseIndex) {
  if (caseIndex === 1) {
    // console.log("compute equity val b0: ", b0);
    // console.log("compute equity val nopat: ", nopat);
    // console.log("compute equity val wacc: ", wacc);
    // console.log("compute equity val noa: ", noa);
    // console.log("compute equity val g: ", g);

    console.log("compute equity val b0: ", b0[caseIndex]);
    console.log("compute equity val nopat: ", nopat[caseIndex]);
    console.log("compute equity val wacc: ", wacc);
    console.log("compute equity val noa: ", noa[caseIndex]);
    console.log("compute equity val g: ", g);

    console.log("typeof g: ", typeof g);

    // console.log("type of g: ", typeof g);
  }
  //compute residual earnings 1 = (NOPAT - r*NOA)/(1+r)
  var re1 = (nopat[caseIndex] - wacc * noa[caseIndex]) / (1 + wacc);

  // compute second term = (NOPAT - r*NOA)/((1+r)*(r-g))
  var re2 =
    (nopat[caseIndex] - wacc * noa[caseIndex]) / ((1 + wacc) * (wacc - g));

  if (caseIndex === 1) {
    console.log("re1: ", re1);
    console.log("re2: ", re2);

    console.log("value that we return: ", b0[caseIndex] + re1 + re2);
  }

  return b0[caseIndex] + re1 + re2;
}

export function computeNetOpAssets(data, caseIndex) {
  return data.operatingAssets[caseIndex] - data.operatingLiabilities[caseIndex];
}

export function computeTotAssets(balanceSheet) {
  const sumCurrentAssets = sumBalanceSheetItems(balanceSheet.currentAssets);
  const sumNonCurrentAssets = sumBalanceSheetItems(
    balanceSheet.nonCurrentAssets
  );

  return sumCurrentAssets + sumNonCurrentAssets;
}

export function computeTotLiab(balanceSheet) {
  const sumCurrentLiab = sumBalanceSheetItems(balanceSheet.currentLiab);
  const sumNonCurrentLiab = sumBalanceSheetItems(balanceSheet.nonCurrentLiab);

  return sumCurrentLiab + sumNonCurrentLiab;
}

export function computeNetLiqValue(balanceSheet) {
  const totalAssets = computeTotAssets(balanceSheet);
  const totalLiabilities = computeTotLiab(balanceSheet);

  console.log("total assets: ", totalAssets);
  console.log("totalLiabilities: ", totalLiabilities);

  return totalAssets - totalLiabilities;
}
