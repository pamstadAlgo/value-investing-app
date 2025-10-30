// import { create } from "@mui/material/styles/createTransitions";
import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  filters: [], //array of all available filters
  autoCompleteFilters: [], //array of all available filters in format compatible for material ui autocomplete input field
  activFilters: [],
  setFilters: {}, //object that contains filters that are currently set
  filteredStocks: [],
  growthRatesPerTicker: {
    date: moment().format("DD-MM-YYYY"),
  }, //stores growth rates for tickers
  customMetricName: "",
  customMetricDescription: "",
  formula: "",
  formulaInnerHtml: "",
  refetchFilterQuantities: false,
  currentFilterView: "",
  savedFilterViews: [],
  viewName: "",
  viewDescription: "",
  queryResult: [],
  charFieldOptions: {},
  dataViewTickers: [],
  additionalColumns: [],
  selectedFilters: [],
  customMetrics: [],
};

export const stockScreenerSlice = createSlice({
  name: "stockscreener",
  initialState,
  reducers: {
    initalizeFilters: (state, action) => {
      state.filters = action.payload;
    },
    initalizeAutocompleteFilters: (state, action) => {
      state.autoCompleteFilters = action.payload;
    },
    initalizeFilteredStocks: (state, action) => {
      state.filteredStocks = action.payload;
    },
    initializeActivFilters: (state, action) => {
      state.activFilters = action.payload;
    },
    initializeSelectedFilters: (state, action) => {
      state.selectedFilters = action.payload;
    },
    resetActiveFilters: (state, action) => {
      state.activFilters = [];
    },
    addSelectedFilter: (state, action) => {
      const filter = { id: uuidv4(), ...action.payload };

      state.selectedFilters.push(filter);
    },
    remvSelectedFilter: (state, action) => {
      //an active filter is either removed with id or its techName; note that it is only removed via techName in the modal with checkbox; it the bin icon is clicked the id is used to delete it
      var filteredArray;
      //check if id property is present
      if (action.payload.hasOwnProperty("id")) {
        filteredArray = state.selectedFilters.filter(
          (item) => item.id !== action.payload.id
        );
      } else {
        filteredArray = state.selectedFilters.filter(
          (item) => item.techName !== action.payload.techName
        );
      }

      state.selectedFilters = filteredArray;
    },
    addActiveFilter: (state, action) => {
      //create a unique id to identify the activeFilter
      const filter = { id: uuidv4(), ...action.payload };

      state.activFilters.push(filter);
    },
    updateActiveFilter: (state, action) => {
      // Find the object by techName
      const obj = state.activFilters.find(
        (item) => item.id === action.payload?.oldValue.id
      );

      if (obj) {
        // Update properties in the found object
        Object.assign(obj, action.payload.newValue);
      }
    },
    updateQtyActiveFilter: (state, action) => {
      //find object by techName
      const obj = state.activFilters.find(
        (item) => item.id === action.payload?.filter.id
      );

      if (obj) {
        // Update properties in the found object
        Object.assign(obj, { qty: action.payload.qty });
      }
    },
    updateComparisonOperator: (state, action) => {
      // Find the object by id
      const obj = state.activFilters.find(
        (item) => item.id === action.payload?.filter.id
      );

      if (obj) {
        // Update properties in the found object
        Object.assign(obj, { comparison: action.payload.comparison });
      }
    },
    remvActiveFilter: (state, action) => {
      //an active filter is either removed with id or its techName; note that it is only removed via techName in the modal with checkbox; it the bin icon is clicked the id is used to delete it
      var filteredArray;
      //check if id property is present
      if (action.payload.hasOwnProperty("id")) {
        filteredArray = state.activFilters.filter(
          (item) => item.id !== action.payload.id
        );
      } else {
        filteredArray = state.activFilters.filter(
          (item) => item.techName !== action.payload.techName
        );
      }

      state.activFilters = filteredArray;
    },
    editSetFilters: (state, action) => {
      // check if filter property is already present in setFilters object
      if (action.payload.value !== "Any") {
        //   in case property is already present we just update the value
        state.setFilters[action.payload.property] = action.payload.value;
      } else {
        delete state.setFilters[action.payload.property];
      }
    },
    remvSetFilter: (state, action) => {
      // check if property existed on that object
      if (state.setFilters.hasOwnProperty(action.payload.property)) {
        delete state.setFilters[action.payload.property];
      }
    },
    resetFilters: (state, action) => {
      state.setFilters = {};
    },
    addGrowthRatesForTicker: (state, action) => {
      state.growthRatesPerTicker[action.payload.ticker] =
        action.payload.growthRates;
    },
    setCustomMetricName: (state, action) => {
      state.customMetricName = action.payload;
    },
    setCustomMetricDescription: (state, action) => {
      state.customMetricDescription = action.payload;
    },
    setFormula: (state, action) => {
      state.formula = action.payload;
    },
    setFormulaInnerHtml: (state, action) => {
      state.formulaInnerHtml = action.payload;
    },
    setRefetchFilterQuantities: (state, action) => {
      state.refetchFilterQuantities = action.payload;
    },
    setCurrentFilterView: (state, action) => {
      state.currentFilterView = action.payload;
    },
    setSavedFilterViews: (state, action) => {
      state.savedFilterViews = action.payload;
    },
    updateSavedFilterViews: (state, action) => {
      let viewToUpdate = state.savedFilterViews.find(
        (item) => item.id === action.payload.id
      );

      if (viewToUpdate) {
        Object.assign(viewToUpdate, action.payload);
      }
    },
    addSaveFilterView: (state, action) => {
      state.savedFilterViews.push(action.payload);
    },
    setViewName: (state, action) => {
      state.viewName = action.payload;
    },
    setViewDescription: (state, action) => {
      state.viewDescription = action.payload;
    },
    setQueryResult: (state, action) => {
      state.queryResult = action.payload;
    },
    setCharFieldOptions: (state, action) => {
      state.charFieldOptions = action.payload;
    },
    setDataViewTickers: (state, action) => {
      state.dataViewTickers = action.payload;
    },
    AddAdditionalColumns: (state, action) => {
      state.additionalColumns.push(action.payload);
    },
    initializeCustomMetrics: (state, action) => {
      state.customMetrics = action.payload;
    },
    addCustomMetric: (state, action) => {
      state.customMetrics.push(action.payload);
    },
    RemvAdditionalColumns: (state, action) => {
      const newArray = state.additionalColumns.filter(
        (item) => item !== action.payload
      );

      state.additionalColumns = newArray;
    },
  },
});

export const {
  initializeCustomMetrics,
  addCustomMetric,
  initalizeFilters,
  addSelectedFilter,
  initalizeAutocompleteFilters,
  editSetFilters,
  initalizeFilteredStocks,
  updateActiveFilter,
  updateComparisonOperator,
  updateQtyActiveFilter,
  remvSetFilter,
  resetFilters,
  addGrowthRatesForTicker,
  addActiveFilter,
  remvActiveFilter,
  resetActiveFilters,
  setCustomMetricName,
  setCustomMetricDescription,
  setFormula,
  setFormulaInnerHtml,
  setRefetchFilterQuantities,
  setCurrentFilterView,
  setSavedFilterViews,
  setViewName,
  initializeSelectedFilters,
  setViewDescription,
  initializeActivFilters,
  addSaveFilterView,
  updateSavedFilterViews,
  setQueryResult,
  setCharFieldOptions,
  setDataViewTickers,
  AddAdditionalColumns,
  RemvAdditionalColumns,
  remvSelectedFilter,
} = stockScreenerSlice.actions;

export default stockScreenerSlice.reducer;
