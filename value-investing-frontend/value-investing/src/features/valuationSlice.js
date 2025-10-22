import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickerSymbols: [],
  selectedTickerSymbols: [],
  epvData: [],
  equityValuePenman: [],
  epvValuations: [],
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
            console.log("newValue we set: ", Number(newValue));
            console.log("newValue we get: ", newValue);

            // updatedValues[caseIndex] = Number(newValue); // update the specific case
            updatedValues[caseIndex] = newValue; // update the specific case

            console.log("updates Values: ", updatedValues);
            return { [key]: updatedValues }; // return updated object
          }

          return metricObj; // leave others unchanged
        });

        //
        console.log("this is udpated state: ", updatedState);
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
} = valuationSlice.actions;

export default valuationSlice.reducer;
