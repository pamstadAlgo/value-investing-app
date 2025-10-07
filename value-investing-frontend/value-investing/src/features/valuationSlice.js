import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickerSymbols: [],
  selectedTickerSymbols: [],
  epvData: [],
  equityValuePenman: [],
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
  },
});

export const {
  initializeTickerSymbols,
  setSelectedTickers,
  setEpvData,
  setPenmanEquityValue,
} = valuationSlice.actions;

export default valuationSlice.reducer;
