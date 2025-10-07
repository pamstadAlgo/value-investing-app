import React from "react";
import { useDispatch, useSelector } from "react-redux";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import {
  AddAdditionalColumns,
  RemvAdditionalColumns,
  setQueryResult,
} from "../../../features/stockScreenerSlice";

function AddColumnFields({ label, field, checked }) {
  const dispatch = useDispatch();
  const screenerState = useSelector((state) => state.stockscrenner);
  const axiosInstanceAuth = useAxiosWithAuth();

  const handleCheckboxChange = (e) => {
    //   check if checkbox is checked (e.target.checked = true) or unchecked (e.target.checked = false)
    if (e.target.checked) {
      console.log("checkbox is check we send post request");
      console.log("field: ", field);
      console.log("datavieTickers: ", screenerState.dataViewTickers);

      dispatch(AddAdditionalColumns(field.techName));

      const payload = {
        qfs_symbols: screenerState.dataViewTickers,
        field: field.techName,
        table: field.table,
      };

      axiosInstanceAuth
        .post("screener/add-column/", payload)
        .then((response) => {
          console.log("response.data: ", response.data);

          //merge data with new column
          const mergedData = screenerState.queryResult.map((item1) => {
            const matchingItem = response.data.find(
              (item2) => item2.qfs_symbol === item1.qfs_symbol_id
            );

            if (matchingItem) {
              return {
                ...item1,
                ...matchingItem,
              };
            }

            return item1;
          });

          dispatch(setQueryResult(mergedData));
        })
        .catch((error) => {
          console.error("ERROR: POST screener/add-column: ", error);
        });
      //   dispatch(addActiveFilter(field));
    } else {
      //remove quantity from array
      //   dispatch(remvActiveFilter(field));
      dispatch(RemvAdditionalColumns(field.techName));

      const propertToRemv = field.techName;

      //remove column from current dataView
      const newData = screenerState.queryResult.map(
        ({ [propertToRemv]: _, ...rest }) => rest
      );

      dispatch(setQueryResult(newData));

      console.log("newData with remove column: ", newData);
      console.log("unchecked; we need to remove and adjust filterquery data");
    }
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleCheckboxChange} />}
      label={label}
    />
  );
}

export default AddColumnFields;
