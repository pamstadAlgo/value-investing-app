import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickerSymbols: [],
  selectedTickerSymbols: [],
  epvData: [],
  equityValuePenman: [],
  epvValuations: [],
  assetValuations: [],
  penmanValuations: [],
};

export const valuationSlice = createSlice({
  name: "valuation",
  initialState,
  reducers: {
    initializeTickerSymbols: (state, action) => {
      state.tickerSymbols = action.payload;
    },
    setSelectedTickers: (state, action) => {
      state.selectedTickerSymbols = action.payload;
    },
    setEpvData: (state, action) => {
      state.epvData = action.payload;
    },
    setPenmanEquityValue: (state, action) => {
      state.equityValuePenman = action.payload;
    },
    initializeEPVValuations: (state, action) => {
      state.epvValuations = action.payload;
    },
    initializeAssetValuations: (state, action) => {
      state.assetValuations = action.payload;
    },
    initializePenmanValuations: (state, action) => {
      state.penmanValuations = action.payload;
    },
    updateAssetValMultChange: (state, action) => {
      const { qfsSymbol, category, metric, newValue } = action.payload;

      // get company out of asset valuation data
      const company = state.assetValuations.find(
        (item) => item.qfsSymbol === qfsSymbol
      );
      if (!company) return; // Symbol not found

      // categories are currentAssets, nonCurrentAssets, etc.
      const items = company.data[category];
      if (!items) return; // Invalid category

      // find the metric of interest
      const target = items.find((entry) => entry.metric === metric);
      if (!target) return; // Metric not found

      target.multiplier = newValue; // Immer lets you mutate directly
    },
    updateAssetValuationData: (state, action) => {
      const { qfsSymbol, category, metric, newValue } = action.payload;

      // get company out of asset valuation data
      const company = state.assetValuations.find(
        (item) => item.qfsSymbol === qfsSymbol
      );
      if (!company) return; // Symbol not found

      // categories are currentAssets, nonCurrentAssets, etc.
      const items = company.data[category];
      if (!items) return; // Invalid category

      // find the metric of interest
      const target = items.find((entry) => entry.metric === metric);
      if (!target) return; // Metric not found

      target.value = newValue; // Immer lets you mutate directly
    },
    updateEPVValuationData: (state, action) => {
      const { newValue, qfsSymbol, metricName, caseIndex } = action.payload;

      //get target object
      const index = state.epvValuations?.findIndex(
        (item) => Object.keys(item)[0] === qfsSymbol
      );

      if (index !== -1) {
        const targetObj = state.epvValuations[index];

        //create new array based on old state
        const updatedState = targetObj[qfsSymbol].map((metricObj) => {
          const key = Object.keys(metricObj)[0];

          // Only update the matching metric
          if (key === metricName) {
            const updatedValues = [...metricObj[key]]; // copy the array

            updatedValues[caseIndex] = newValue; // update the specific case

            return { [key]: updatedValues }; // return updated object
          }

          return metricObj; // leave others unchanged
        });

        targetObj[qfsSymbol] = updatedState;

        //update state
        state.epvValuations[index] = targetObj;
      }
    },
  },
});

export const {
  initializeTickerSymbols,
  setSelectedTickers,
  initializeEPVValuations,
  setEpvData,
  setPenmanEquityValue,
  updateEPVValuationData,
  updateAssetValuationData,
  updateAssetValMultChange,
  initializeAssetValuations,
  initializePenmanValuations,
} = valuationSlice.actions;

export default valuationSlice.reducer;
