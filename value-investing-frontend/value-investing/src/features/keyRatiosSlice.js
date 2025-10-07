import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickerSymbols: [],
  ticker: {},
  autocompleteTickerSelect: {},
  // keyRatios: [],
  keyRatios: {
    profitability: [],
    liquidity: [],
    solvency: [],
    earnings: [],
  },
};

export const keyRatioSlice = createSlice({
  name: "keyratios",
  initialState,
  reducers: {
    initalizeTickerSymbols: (state, action) => {
      state.tickerSymbols = action.payload;
    },
    initalizeTicker: (state, action) => {
      state.ticker = action.payload;
    },
    initalizeKeyRatios: (state, action) => {
      state.keyRatios = initialState.keyRatios;
    },
    handleAutoCompleteTickerChange: (state, action) => {
      state.autocompleteTickerSelect = action.payload;
    },
    addKeyRatio: (state, action) => {
      // state.keyRatios.push(action.payload);
      state.keyRatios[action.payload.property].push(action.payload.ratio);
    },
  },
});

export const {
  initalizeTickerSymbols,
  initalizeTicker,
  initalizeKeyRatios,
  addKeyRatio,
  handleAutoCompleteTickerChange,
} = keyRatioSlice.actions;

export default keyRatioSlice.reducer;
