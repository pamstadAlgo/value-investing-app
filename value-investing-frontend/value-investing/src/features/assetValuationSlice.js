import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentAssets: [],
  nonCurrentAssets: [],
  totalCurrentAssets: {
    name: "Total current assets",
    descn:
      "Total current assets is the sum of all current assets. The reduction factor results from the reduction factor of all items included in current assets.",
    bookValue: 0,
    reductionFactor: 0,
    value: 0,
    percentalTotalAssets: 0,
  },
  totalNonCurrentAssets: {
    name: "Total non-current assets",
    descn:
      "Total non-current assets is the sum of all non-current assets. The reduction factor results from the reduction factor of all items included in non-current assets.",
    bookValue: 0,
    reductionFactor: 0,
    value: 0,
    percentalTotalAssets: 0,
  },
  totalCurrentLiabilities: {
    name: "Total current liabilities",
    descn:
      "Total current liabilities is the sum of all current liabilities. The reduction factor results from the reduction factor all items included in current liabilitites.",
    bookValue: 0,
    reductionFactor: 0,
    value: 0,
    percentalTotalAssets: 0,
  },
  totalNonCurrentLiabilities: {
    name: "Total non-current liabilities",
    descn:
      "Total non-current liabilities is the sum of all non-current liabilities. The reduction factor results from the reduction factor all items included in non-current liabilitites.",
    bookValue: 0,
    reductionFactor: 0,
    value: 0,
    percentalTotalAssets: 0,
  },
  totalAssets: {
    name: "Total Assets",
    descn: "Sum of current and non-current assets",
    reductionFactor: 0,
    bookValue: 0,
    value: 0,
  },
  totalLiabilities: {
    name: "Total Liabilities",
    descn: "Sum of current and non-current liabilities",
    reductionFactor: 0,
    bookValue: 0,
    value: 0,
  },
  currentLiabilities: [],
  nonCurrentLiabilities: [],
  unit: 1000000, //dividor of balance sheet items
  finStatementsPeriod: "q",
  finStatementDate: "",
  finStatementsDates: [],
  dataPlotted: [],
  displayFigureClick: false,
  figureCoordinates: {
    x: 0,
    y: 0,
  },
  figureLegendLabel: "",
};

export const assetValuationSlice = createSlice({
  name: "assetvaluation",
  initialState,
  reducers: {
    changeFigureCoordinates: (state, action) => {
      state.figureCoordinates[action.payload.property] = action.payload.value;
    },
    initalizeCurrentAssets: (state, action) => {
      state.currentAssets = action.payload;
    },
    addCurrentAsset: (state, action) => {
      state.currentAssets.push(action.payload);
    },
    addNonCurrentAsset: (state, action) => {
      state.nonCurrentAssets.push(action.payload);
    },
    addNonCurrentLiability: (state, action) => {
      state.nonCurrentLiabilities.push(action.payload);
    },
    removeCurrentAsset: (state, action) => {
      let newState = action.payload.currentState.filter((item) => {
        return item.id !== action.payload.id;
      });
      state.currentAssets = newState;
    },
    removeNonCurrentAsset: (state, action) => {
      let newState = action.payload.currentState.filter((item) => {
        return item.id !== action.payload.id;
      });
      state.nonCurrentAssets = newState;
    },
    removeNonCurrentLiability: (state, action) => {
      let newState = action.payload.currentState.filter((item) => {
        return item.id !== action.payload.id;
      });
      state.nonCurrentLiabilities = newState;
    },
    removeCurrentLiability: (state, action) => {
      let newState = action.payload.currentState.filter((item) => {
        return item.id !== action.payload.id;
      });
      state.currentLiabilities = newState;
    },
    addCurrentLiability: (state, action) => {
      state.currentLiabilities.push(action.payload);
    },
    changeFigureLegendLabel: (state, action) => {
      state.figureLegendLabel = action.payload;
    },
    initalizeNonCurrentAssets: (state, action) => {
      state.nonCurrentAssets = action.payload;
    },
    initalizeCurrentLiabilities: (state, action) => {
      state.currentLiabilities = action.payload;
    },
    initalizeNonCurrentLiabilities: (state, action) => {
      state.nonCurrentLiabilities = action.payload;
    },
    initalizeData: (state, action) => {
      state.dataPlotted = action.payload;
    },
    changeDisplayFigureClick: (state, action) => {
      state.displayFigureClick = action.payload;
    },
    changeNonCurrentItems: (state, action) => {
      let items = [];

      if (action.payload.method === "Assets") {
        items = state.nonCurrentAssets;
      } else if (action.payload.method === "Liabilities") {
        items = state.nonCurrentLiabilities;
      }

      // find index of current asset you like to change
      let propertVal = action.payload.property;

      let value = {};
      value[propertVal] = action.payload.value;

      let newArray = items.map((item) => {
        if (item.id === action.payload.id) {
          return { ...item, ...value };
        } else {
          return item;
        }
      });

      if (action.payload.method === "Assets") {
        state.nonCurrentAssets = newArray;
      } else if (action.payload.method === "Liabilities") {
        state.nonCurrentLiabilities = newArray;
      }
    },

    changeCurrentItems: (state, action) => {
      let items = [];

      if (action.payload.method === "Assets") {
        items = state.currentAssets;
      } else if (action.payload.method === "Liabilities") {
        items = state.currentLiabilities;
      }

      // find index of current asset you like to change
      let propertVal = action.payload.property;

      let value = {};
      value[propertVal] = action.payload.value;

      let newArray = items.map((item) => {
        if (item.name === action.payload.name) {
          return { ...item, ...value };
        } else {
          return item;
        }
      });

      if (action.payload.method === "Assets") {
        state.currentAssets = newArray;
      } else if (action.payload.method === "Liabilities") {
        state.currentLiabilities = newArray;
      }
    },
    // changeNonCurrentItems: (state, action) => {
    //   let items = [];

    //   if (action.payload.method === "Assets") {
    //     items = state.nonCurrentAssets;
    //   } else if (action.payload.method === "Liabilities") {
    //     items = state.nonCurrentLiabilities;
    //   }

    //   // find index of current asset you like to change
    //   let propertVal = action.payload.property;

    //   let value = {};
    //   value[propertVal] = action.payload.value;

    //   let newArray = items.map((item) => {
    //     if (item.name === action.payload.name) {
    //       return { ...item, ...value };
    //     } else {
    //       return item;
    //     }
    //   });

    //   if (action.payload.method === "Assets") {
    //     state.nonCurrentAssets = newArray;
    //   } else if (action.payload.method === "Liabilities") {
    //     state.nonCurrentLiabilities = newArray;
    //   }
    // },
    changeFinStatementPeriod: (state, action) => {
      state.finStatementsPeriod = action.payload;
    },
    initalizeFinStatementsDates: (state, action) => {
      state.finStatementsDates = action.payload;
    },
    changeFinStatementDate: (state, action) => {
      state.finStatementDate = action.payload;
    },
    changeUnit: (state, action) => {
      state.unit = action.payload;
    },
    computeTotalCurrentAssets: (state, action) => {
      let bookValueTotalCurrentAssets = 0;
      let valueTotalCurrentAssets = 0;
      // loop over current assets array to compute book value and value of total current assets
      let i = 0;
      while (i < action.payload.length) {
        bookValueTotalCurrentAssets += action.payload[i].bookValue;
        valueTotalCurrentAssets +=
          (action.payload[i].bookValue * action.payload[i].reductionFactor) /
          100;
        i++;
      }

      state.totalCurrentAssets["bookValue"] = bookValueTotalCurrentAssets;
      state.totalCurrentAssets["value"] = valueTotalCurrentAssets;
      state.totalCurrentAssets["reductionFactor"] = (
        (valueTotalCurrentAssets / bookValueTotalCurrentAssets) *
        100
      ).toFixed(1);
    },
    computeTotalCurrentLiabilities: (state, action) => {
      let bookValueTotalCurrentAssets = 0;
      let valueTotalCurrentAssets = 0;
      // loop over current assets array to compute book value and value of total current assets
      let i = 0;
      while (i < action.payload.length) {
        bookValueTotalCurrentAssets += action.payload[i].bookValue;
        valueTotalCurrentAssets +=
          (action.payload[i].bookValue * action.payload[i].reductionFactor) /
          100;
        i++;
      }

      state.totalCurrentLiabilities["bookValue"] = bookValueTotalCurrentAssets;
      state.totalCurrentLiabilities["value"] = valueTotalCurrentAssets;
      state.totalCurrentLiabilities["reductionFactor"] = (
        (valueTotalCurrentAssets / bookValueTotalCurrentAssets) *
        100
      ).toFixed(1);
    },
    computeTotalNonCurrentLiabilities: (state, action) => {
      let bookValueTotalCurrentAssets = 0;
      let valueTotalCurrentAssets = 0;
      // loop over current assets array to compute book value and value of total current assets
      let i = 0;
      while (i < action.payload.length) {
        bookValueTotalCurrentAssets += action.payload[i].bookValue;
        valueTotalCurrentAssets +=
          (action.payload[i].bookValue * action.payload[i].reductionFactor) /
          100;
        i++;
      }

      state.totalNonCurrentLiabilities["bookValue"] =
        bookValueTotalCurrentAssets;
      state.totalNonCurrentLiabilities["value"] = valueTotalCurrentAssets;
      state.totalNonCurrentLiabilities["reductionFactor"] = (
        (valueTotalCurrentAssets / bookValueTotalCurrentAssets) *
        100
      ).toFixed(1);
    },
    computeTotalNonCurrentAssets: (state, action) => {
      let bookValueTotalCurrentAssets = 0;
      let valueTotalCurrentAssets = 0;
      // loop over current assets array to compute book value and value of total current assets
      let i = 0;
      while (i < action.payload.length) {
        bookValueTotalCurrentAssets += action.payload[i].bookValue;
        valueTotalCurrentAssets +=
          (action.payload[i].bookValue * action.payload[i].reductionFactor) /
          100;
        i++;
      }

      state.totalNonCurrentAssets["bookValue"] = bookValueTotalCurrentAssets;
      state.totalNonCurrentAssets["value"] = valueTotalCurrentAssets;
      state.totalNonCurrentAssets["reductionFactor"] = (
        (valueTotalCurrentAssets / bookValueTotalCurrentAssets) *
        100
      ).toFixed(1);
    },
    computeTotalAssets: (state, action) => {
      let bookValueTotalAssets =
        action.payload.totalCurrentAssets.bookValue +
        action.payload.totalNonCurrentAssets.bookValue;
      let valueTotalAssets =
        action.payload.totalCurrentAssets.value +
        action.payload.totalNonCurrentAssets.value;

      state.totalAssets["bookValue"] = bookValueTotalAssets;
      state.totalAssets["value"] = valueTotalAssets;
      state.totalAssets["reductionFactor"] = (
        (valueTotalAssets / bookValueTotalAssets) *
        100
      ).toFixed(1);
    },
    computeTotalLiabilities: (state, action) => {
      let bookValueTotalAssets =
        action.payload.totalCurrentLiabilities.bookValue +
        action.payload.totalNonCurrentLiabilities.bookValue;
      let valueTotalAssets =
        action.payload.totalCurrentLiabilities.value +
        action.payload.totalNonCurrentLiabilities.value;

      state.totalLiabilities["bookValue"] = bookValueTotalAssets;
      state.totalLiabilities["value"] = valueTotalAssets;
      state.totalLiabilities["reductionFactor"] = (
        (valueTotalAssets / bookValueTotalAssets) *
        100
      ).toFixed(1);
    },
  },
});

export const {
  changeFigureCoordinates,
  addNonCurrentAsset,
  addNonCurrentLiability,
  addCurrentLiability,
  initalizeCurrentAssets,
  changeCurrentItems,
  changeFinStatementPeriod,
  initalizeFinStatementsDates,
  changeFinStatementDate,
  changeUnit,
  changeFigureLegendLabel,
  changeDisplayFigureClick,
  computeTotalCurrentAssets,
  changeNonCurrentItems,
  computeTotalNonCurrentAssets,
  computeTotalCurrentLiabilities,
  computeTotalNonCurrentLiabilities,
  initalizeNonCurrentAssets,
  computeTotalAssets,
  computeTotalLiabilities,
  initalizeCurrentLiabilities,
  initalizeNonCurrentLiabilities,
  initalizeData,
  addCurrentAsset,
  removeCurrentAsset,
  removeNonCurrentAsset,
  removeNonCurrentLiability,
  removeCurrentLiability,
} = assetValuationSlice.actions;

export default assetValuationSlice.reducer;
