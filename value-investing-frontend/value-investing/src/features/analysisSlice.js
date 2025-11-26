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
  valuationApproach: "topDown",
  taxRate: 0.25,
  wacc: 0.1,
  terminalGrowthRate: 0,
  //   tickerSymbols: [],
  //   selectedTickerSymbols: [],
  //   epvData: [],
  //   equityValuePenman: [],
  //   epvValuations: [],
  //   assetValuations: [],
  //   penmanValuations: [],
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
    setValuationApproach: (state, action) => {
      state.valuationApproach = action.payload;
    },
    initializeValuationData: (state, action) => {
      state.valuationData = action.payload;
    },
    updateValuationData: (state, action) => {
      const { newValue, metricName, caseIndex } = action.payload;

      state.valuationData[metricName][caseIndex] = newValue;
    },
    changeTaxRate: (state, action) => {
      state.taxRate = action.payload;
    },
    changeWacc: (state, action) => {
      state.wacc = action.payload;
    },
    changeTerminalGrowthRate: (state, action) => {
      state.terminalGrowthRate = action.payload;
    },
  },
});

export const {
  changeTaxRate,
  changeWacc,
  changeTerminalGrowthRate,
  initializeValuationData,
  initializeTickerSymbol,
  initializeCompanyData,
  setValuationApproach,
  updateValuationData,
} = analysisSlice.actions;

export default analysisSlice.reducer;
