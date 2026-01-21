import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosConfig";

const initialState = {
  watchlists: [],
  activeListId: null, 
  status: "idle",
  error: null,
  history: [], // Store history for the viewer
  historyStatus: "idle",
};

// --- Async Thunks ---

export const fetchWatchlists = createAsyncThunk(
  "watchlist/fetchWatchlists",
  async () => {
    const response = await axiosInstance.get("watchlist/");
    return response.data;
  }
);

export const createWatchlist = createAsyncThunk(
  "watchlist/createWatchlist",
  async (watchlistData) => {
    const response = await axiosInstance.post("watchlist/", watchlistData);
    return response.data;
  }
);

export const deleteWatchlist = createAsyncThunk(
  "watchlist/deleteWatchlist",
  async (watchlistId) => {
    await axiosInstance.delete(`watchlist/${watchlistId}/`);
    return watchlistId;
  }
);

export const addStockToWatchlist = createAsyncThunk(
  "watchlist/addStock",
  async ({ watchlistId, ticker }) => {
    const response = await axiosInstance.post(
      `watchlist/${watchlistId}/add_stock/`,
      { ticker }
    );
    return { watchlistId, item: response.data };
  }
);

export const removeStockFromWatchlist = createAsyncThunk(
  "watchlist/removeStock",
  async ({ watchlistId, ticker }) => {
    await axiosInstance.post(`watchlist/${watchlistId}/remove_stock/`, {
      ticker,
    });
    return { watchlistId, ticker };
  }
);

export const shareWatchlist = createAsyncThunk(
  "watchlist/shareWatchlist",
  async ({ watchlistId, email }) => {
    const response = await axiosInstance.post(
      `watchlist/${watchlistId}/share/`,
      { email }
    );
    return response.data;
  }
);

// --- NEW: Save Valuation (POST = Create new history entry) ---
export const saveValuationToWatchlist = createAsyncThunk(
  "watchlist/saveValuation",
  async ({ watchlistId, ticker, price_target, notes, valuation_date, valuation_inputs }) => {
    const response = await axiosInstance.post( // Changed from PATCH to POST
      `watchlist/${watchlistId}/save_valuation/`,
      { ticker, price_target, notes, valuation_date, valuation_inputs }
    );
    return { watchlistId, item: response.data };
  }
);

// --- NEW: Fetch Valuation History ---
export const fetchValuationHistory = createAsyncThunk(
  "watchlist/fetchHistory",
  async ({ watchlistId, ticker }) => {
    const response = await axiosInstance.get(
      `watchlist/${watchlistId}/history/${ticker}/`
    );
    return response.data; // Returns list of historical valuations
  }
);

// --- Slice ---

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.history = [];
      state.historyStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watchlists
      .addCase(fetchWatchlists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWatchlists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.watchlists = action.payload;
      })
      .addCase(fetchWatchlists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Create
      .addCase(createWatchlist.fulfilled, (state, action) => {
        state.watchlists.unshift(action.payload);
      })
      // Delete
      .addCase(deleteWatchlist.fulfilled, (state, action) => {
        state.watchlists = state.watchlists.filter(
          (list) => list.id !== action.payload
        );
      })
      // Add Stock
      .addCase(addStockToWatchlist.fulfilled, (state, action) => {
        const { watchlistId, item } = action.payload;
        const watchlist = state.watchlists.find((w) => w.id === watchlistId);
        if (watchlist) {
          if (!watchlist.items) watchlist.items = [];
          const exists = watchlist.items.find((i) => i.ticker === item.ticker);
          if (!exists) {
            watchlist.items.unshift(item);
          }
        }
      })
      // Remove Stock
      .addCase(removeStockFromWatchlist.fulfilled, (state, action) => {
        const { watchlistId, ticker } = action.payload;
        const watchlist = state.watchlists.find((w) => w.id === watchlistId);
        if (watchlist && watchlist.items) {
          watchlist.items = watchlist.items.filter(
            (i) => i.ticker !== ticker && i.qfs_symbol !== ticker
          );
        }
      })
      // Save Valuation (Update the Item in the list with latest values)
      .addCase(saveValuationToWatchlist.fulfilled, (state, action) => {
        const { watchlistId, item } = action.payload;
        const watchlist = state.watchlists.find((w) => w.id === watchlistId);
        if (watchlist && watchlist.items) {
          const index = watchlist.items.findIndex((i) => i.id === item.id);
          if (index !== -1) {
            watchlist.items[index] = item;
          }
        }
      })
      // Fetch History
      .addCase(fetchValuationHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(fetchValuationHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      });
  },
});

export const { clearHistory } = watchlistSlice.actions;
export default watchlistSlice.reducer;