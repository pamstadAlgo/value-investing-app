import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTickerSymbol: null,
  companyData: {},
  valuationData: {
    revenue: [0, 0, 0],
    cogs: [0, 0, 0],
    sga: [0, 0, 0],
    rnd: [0, 0, 0],
    other_opex: [0, 0, 0],
    op_margins: [0, 0, 0],
  },
  balanceSheet: {},
  valuationApproach: "topDown",
  taxRate: 0.25,
  wacc: 0.1,
  terminalGrowthRate: 0,
  savedModels: []
};

export const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    initializeTickerSymbol: (state, action) => {
      state.selectedTickerSymbol = action.payload;
    },
    initializeCompanyData: (state, action) => {
      state.companyData = action.payload;
    },
    initalizeBalanceSheet: (state, action) => {
      state.balanceSheet = action.payload;
    },
    setValuationApproach: (state, action) => {
      state.valuationApproach = action.payload;
    },
    initializeValuationData: (state, action) => {
      state.valuationData = action.payload;
    },
    updateValuationData: (state, action) => {
      const { newValue, metricName, caseIndex, scaleFactor } = action.payload;

      state.valuationData[metricName][caseIndex] = newValue * scaleFactor;
    },
    updateLiquidationValuationData: (state, action) => {
      const { category, metric, newValue } = action.payload;

      //extract correct category. Catgories are currentAssets, nonCurrentAssets, currentLiabilities, etc.
      const items = state.balanceSheet[category];
      if (!items) return; // Invalid category

      // find the metric of interest
      const target = items.find((entry) => entry.metric === metric);
      if (!target) return; // Metric not found

      target.value = newValue; // Immer lets you mutate directly
    },
    updateLiqValMultChange: (state, action) => {
      const { category, metric, newValue } = action.payload;

      const items = state.balanceSheet[category];
      if (!items) return; // Invalid category

      // find the metric of interest
      const target = items.find((entry) => entry.metric === metric);
      if (!target) return; // Metric not found

      target.multiplier = newValue; // Immer lets you mutate directly
    },
    changeTaxRate: (state, action) => {
      state.taxRate = action.payload;
    },
    changeWacc: (state, action) => {
      state.wacc = action.payload;
    },
    changeNrShares: (state, action) => {
      state.companyData.nrShares = action.payload;
    },
    changeTerminalGrowthRate: (state, action) => {
      state.terminalGrowthRate = action.payload;
    },
  },
});

export const {
  changeTaxRate,
  updateLiquidationValuationData,
  updateLiqValMultChange,
  changeNrShares,
  changeWacc,
  changeTerminalGrowthRate,
  initializeValuationData,
  initializeTickerSymbol,
  initializeCompanyData,
  setValuationApproach,
  updateValuationData,
  initalizeBalanceSheet,
} = analysisSlice.actions;

export default analysisSlice.reducer;
