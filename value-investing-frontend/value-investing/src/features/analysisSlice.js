import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTickerSymbol: null,
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
  },
});

export const { initializeTickerSymbol } = analysisSlice.actions;

export default analysisSlice.reducer;
