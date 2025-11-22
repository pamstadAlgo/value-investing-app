import React, { useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useDispatch, useSelector } from "react-redux";
import { VariableSizeList } from "react-window";
import TextField from "@mui/material/TextField";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { initializeTickerSymbols } from "../../../features/valuationSlice";
import Chip from "@mui/material/Chip";
import { initializeTickerSymbol } from "../../../features/analysisSlice";
import { useSnackbar } from "../../GlobalComponents/SnackbarProvider";

const LISTBOX_PADDING = 8; // px

// Custom listbox using react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;

  function getHeight(index) {
    return 48; // Fixed height for each option
  }

  return (
    <div ref={ref} {...other}>
      <VariableSizeList
        height={250} // Adjust dropdown height
        width="100%"
        itemSize={getHeight}
        itemCount={itemCount}>
        {({ index, style }) => (
          <div style={{ ...style, top: style.top + LISTBOX_PADDING }}>
            {itemData[index]}
          </div>
        )}
      </VariableSizeList>
    </div>
  );
});

function CompanySearchField() {
  const analysisState = useSelector((state) => state.analysis);
  const tickerSymbols = useSelector((state) => state.valuation.tickerSymbols);

  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  const { showMessage } = useSnackbar();

  const handleChange = (event, newValue) => {
    dispatch(initializeTickerSymbol(newValue));

    if (newValue) {
      console.log("this is new newValue: ", newValue);
      console.log("event.target.value: ", event.target.value);

      //fetch data for selected ticker symbol
      axiosInstanceAuth
        .get(`screener/analysis/${newValue.qfs_symbol}/`)
        .then((response) => {
          console.log("response.data from analysis request: ", response.data);
        })
        .catch((error) => {
          showMessage(`Error fetching data: ${error}`);
          console.error("ERROR: GET screener/analysis/: ", error);
        });
    }
  };

  useEffect(() => {
    axiosInstanceAuth
      .get("/screener/get-ticker-symbols/")
      .then((response) => {
        console.log("response.data ticker symbols: ", response.data);
        dispatch(initializeTickerSymbols(response.data.data));
      })
      .catch((error) => {
        console.error("ERROR: GET /screener/get-ticker-symbols/: ", error);
      });
  }, []);

  return (
    <div>
      <Autocomplete
        value={analysisState.selectedTickerSymbol}
        options={tickerSymbols}
        ListboxComponent={ListboxComponent}
        onChange={handleChange}
        getOptionLabel={(option) => `${option.qfs_symbol} - ${option.name}`}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Select an item"
            name="tickers"
          />
        )}
      />
    </div>
  );
}

export default CompanySearchField;
