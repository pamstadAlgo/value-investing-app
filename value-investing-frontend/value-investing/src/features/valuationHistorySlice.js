import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosConfig";

// --- Async Thunks ---

export const saveValuationSnapshot = createAsyncThunk(
  "history/saveSnapshot",
  async (payload, { rejectWithValue }) => {
    try {
      // Payload: qfs_symbol, price_target, thesis, tags, model_inputs, etc.
      const response = await axiosInstance.post("/history/snapshots/", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchValuationHistory = createAsyncThunk(
  "history/fetchHistory",
  async ({ ticker }, { rejectWithValue }) => {
    try {
      // Fetch only the logged-in user's history for this ticker
      const response = await axiosInstance.get(
        `/history/snapshots/my_history/?ticker=${ticker}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// --- Slice ---

const valuationHistorySlice = createSlice({
  name: "valuationHistory",
  initialState: {
    history: [], // List of snapshots for the currently viewed stock
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    saveStatus: "idle", // Track saving state separately
    error: null,
  },
  reducers: {
    clearHistory: (state) => {
      state.history = [];
      state.status = "idle";
      state.error = null;
    },
    resetSaveStatus: (state) => {
      state.saveStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchValuationHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchValuationHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.history = action.payload;
      })
      .addCase(fetchValuationHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Save Snapshot
      .addCase(saveValuationSnapshot.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(saveValuationSnapshot.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        // Optimistically add the new snapshot to the top of the list
        state.history.unshift(action.payload);
      })
      .addCase(saveValuationSnapshot.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearHistory, resetSaveStatus } = valuationHistorySlice.actions;
export default valuationHistorySlice.reducer;