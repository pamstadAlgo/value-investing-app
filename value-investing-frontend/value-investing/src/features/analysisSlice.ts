import { createSlice } from "@reduxjs/toolkit";
import { ExistingModel, type SelectedModel } from "./analysisTypes";
import { PayloadAction } from "@reduxjs/toolkit";

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
  savedModels: [] as ExistingModel[],
  selectedModel: { isNew: true } as SelectedModel,
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
      let { newValue, metricName, caseIndex, scaleFactor } = action.payload;

      let value;
      console.log("DEBUG newValue we get: ", newValue);

      //check if scale factor must be inversed; for percentage we scale with 0.01 in ui
      // if (scaleFactor < 1) {
      //   scaleFactor = 1 / scaleFactor;
      // }

      //check if value is valid number; if not don't scale otherwise it is converted to number
      if (isNaN(Number(newValue)) || !newValue) {
        console.log("we are in isNAN case");
        value = newValue;
      } else {
        value = newValue * scaleFactor;
      }

      console.log("DEBUG value we set: ", value);

      // state.valuationData[metricName][caseIndex] = newValue * scaleFactor;
      state.valuationData[metricName][caseIndex] = value;
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
      (state.companyData as any).nrShares = action.payload;
    },
    changeTerminalGrowthRate: (state, action) => {
      state.terminalGrowthRate = action.payload;
    },
    initializeSavedModels: (state, action: PayloadAction<ExistingModel[]>) => {
      state.savedModels = action.payload;
    },
    setSelectedModel: (state, action: PayloadAction<SelectedModel>) => {
      state.selectedModel = action.payload;
    },
    updateSavedModels: (state, action: PayloadAction<ExistingModel>) => {
      //check if model already exists
      const modelIndex = state.savedModels.findIndex(
        (item) => item.id === action.payload.id
      );

      if (modelIndex === -1) {
        state.savedModels.push(action.payload);
      } else {
        state.savedModels[modelIndex] = action.payload;
      }
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
  initializeSavedModels,
  setSelectedModel,
  updateSavedModels,
} = analysisSlice.actions;

export default analysisSlice.reducer;
