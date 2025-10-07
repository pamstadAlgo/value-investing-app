import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mccProfiles: [],
};

export const microcapSlice = createSlice({
  name: "microcap",
  initialState,
  reducers: {
    initializeMccProfiles: (state, action) => {
      state.mccProfiles = action.payload;
    },
  },
});

export const { initializeMccProfiles } = microcapSlice.actions;

export default microcapSlice.reducer;
