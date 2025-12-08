import { combineReducers, configureStore } from "@reduxjs/toolkit";
import keyRatioReducer from "../features/keyRatiosSlice";
import assetValuationReducer from "../features/assetValuationSlice";
import stockScreenerReducer from "../features/stockScreenerSlice";
import valuationReducer from "../features/valuationSlice";
import microcapReducer from "../features/microcapSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import localforage from "localforage";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import analysisReducer from "../features/analysisSlice";
import { PersistPartial } from "redux-persist/es/persistReducer";
// import type { PersistPartial } from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage: localforage,
  stateReconciler: autoMergeLevel2,
};

const rootReducer = combineReducers({
  keyratios: keyRatioReducer,
  assetvaluation: assetValuationReducer,
  stockscrenner: stockScreenerReducer,
  valuation: valuationReducer,
  microcap: microcapReducer,
  analysis: analysisReducer,
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
