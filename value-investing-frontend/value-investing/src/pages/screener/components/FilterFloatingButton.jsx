import React from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import Fab from "@mui/material/Fab";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { useSelector } from "react-redux";

function FilterFloatingButton() {
  const screenerState = useSelector((state) => state.stockscrenner);

  const axiosInstanceAuth = useAxiosWithAuth();

  const handleFilterStocks = () => {
    axiosInstanceAuth
      .post("/screener/filter-query/", screenerState.selectedFilters)
      .then((response) => {
        console.log("response of filter query: ", response.data);
        // dispatch(setQueryResult(response.data?.queryResult));
      })
      .catch((error) => {
        console.error("ERROR: POST /screener/filter-query/: ", error);
      });
  };

  return (
    <Fab
      variant="extended"
      size="medium"
      contained-custom-button
      className="custom-fab-filtering"
      onClick={handleFilterStocks}>
      <FilterAltOutlinedIcon sx={{ mr: 1 }} className="button-icon" />
      Filter
    </Fab>
  );
}

export default FilterFloatingButton;
