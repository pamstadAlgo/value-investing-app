import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import localforage from "localforage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

// Reducers
import keyRatioReducer from "../features/keyRatiosSlice";
import assetValuationReducer from "../features/assetValuationSlice";
import stockScreenerReducer from "../features/stockScreenerSlice";
import valuationReducer from "../features/valuationSlice";
import microcapReducer from "../features/microcapSlice";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import analysisReducer from "../features/analysisSlice";
import { PersistPartial } from "redux-persist/es/persistReducer";
import watchlistReducer from "../features/watchlistSlice";
import valuationHistoryReducer from "../features/valuationHistorySlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage: localforage,
  stateReconciler: autoMergeLevel2,
  // We blacklist 'valuationHistory' so it always fetches fresh data from the server
  blacklist: ["valuationHistory", "watchlist"],
};

const rootReducer = combineReducers({
  keyratios: keyRatioReducer,
  assetvaluation: assetValuationReducer,
  stockscrenner: stockScreenerReducer,
  valuation: valuationReducer,
  microcap: microcapReducer,
  analysis: analysisReducer,
  watchlist: watchlistReducer,
  valuationHistory: valuationHistoryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Types for TypeScript
export type RootState = ReturnType<typeof rootReducer> & PersistPartial;
export type AppDispatch = typeof store.dispatch;
