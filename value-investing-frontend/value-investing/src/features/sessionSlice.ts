import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { sessionSliceState } from "./sessionTypes";

const initialState: sessionSliceState = {
  userId: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<number>) => {
      state.userId = action.payload;
    },
  },
});

export const { setUserId } = sessionSlice.actions;

export default sessionSlice.reducer;
