import React, { useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { VariableSizeList } from "react-window";
import Chip from "@mui/material/Chip";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { useDispatch, useSelector } from "react-redux";
import { initalizeTickerSymbols } from "../../../features/keyRatiosSlice";
import {
  initializeTickerSymbols,
  setSelectedTickers,
} from "../../../features/valuationSlice";

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

function TickerAutoComplete({ formik }) {
  const options = Array.from(new Array(35000)).map(
    (_, index) => `Item ${index + 1}`
  );
  const valuationState = useSelector((state) => state.valuation);

  const dispatch = useDispatch();

  const axiosInstanceAuth = useAxiosWithAuth();

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

  const handleInputChange = (event, newInputValue) => {
    console.log("this is new inputValue: ", newInputValue);
    console.log("event.target.value: ", event.target.value);
  };

  const handleChange = (event, newValue) => {
    console.log("this is new newValue: ", newValue);
    console.log("event.target.value: ", event.target.value);
    dispatch(setSelectedTickers(newValue));

    // if (newValue?.length > 0) {
    //   formik.setFieldValue("tickers", "non-empty");
    // } else {
    //   formik.setFieldValue("tickers", "");
    // }
  };

  return (
    <div>
      <Autocomplete
        multiple
        disableCloseOnSelect
        //   options={options}
        value={valuationState.selectedTickerSymbols}
        options={valuationState.tickerSymbols}
        ListboxComponent={ListboxComponent}
        onChange={handleChange}
        onInputChange={handleInputChange}
        getOptionLabel={(option) => `${option.qfs_symbol} - ${option.name}`}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={`${option.qfs_symbol}`}
                {...tagProps}
                //   disabled={fixedOptions.includes(option)}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Select an item"
            name="tickers"
            helperText={
              formik?.errors.tickers && formik?.touched.tickers
                ? formik?.errors.tickers
                : " "
            }
            error={
              formik?.errors.tickers && formik?.touched.tickers ? true : false
            }
          />
        )}
      />
    </div>
  );
}

export default TickerAutoComplete;
