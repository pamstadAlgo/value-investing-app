import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../axios/axiosConfig";
import {
  editSetFilters,
  initalizeFilteredStocks,
  // initalizeFilters,
  remvSetFilter,
  resetFilters,
} from "../../../features/stockScreenerSlice";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

function Filters() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const keyRatiosState = useSelector((state) => state.keyratios);

  const dispatch = useDispatch();

  useEffect(() => {
    axiosInstance
      .get("/screener/filter-options/")
      .then((response) => {
        // dispatch(initalizeFilters(response.data));
      })
      .catch((error) =>
        console.error("error GET /screener/filter-options/: ", error)
      );
  }, []);

  const handleFilterClick = () => {
    axiosInstance
      .post("/screener/filtered-stocks/", screenerState.setFilters)
      .then((response) => {
        // we will filter stocks to the symbols that are present in financial modelling prep
        var res = response.data.filter((n) =>
          keyRatiosState.tickerSymbols.some((n2) => n.ticker == n2.symbol)
        );
        dispatch(initalizeFilteredStocks(res));
      });
  };

  return (
    <div>
      <div className="flexbox-title-reset-button">
        <h2>Stock Screener Filters</h2>{" "}
        <Button
          variant="outlined"
          className="reset-stockscreener-filters"
          onClick={() => {
            dispatch(resetFilters("reset"));
          }}>
          Reset filters
        </Button>
        <Button variant="contained" onClick={handleFilterClick}>
          Filter
        </Button>
      </div>
      <div className="filters-flexbox-wrapper">
        {screenerState.filters.map((filter) => {
          return (
            <FormControl
              style={{ minWidth: "230px", maxWidth: "230px" }}
              key={filter.filter}>
              <InputLabel id="demo-simple-select-label">
                {filter.filter}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={
                  screenerState.setFilters.hasOwnProperty(filter.filter)
                    ? screenerState.setFilters[filter.filter]
                    : ""
                }
                label={filter.filter}
                onChange={(e) =>
                  dispatch(
                    editSetFilters({
                      property: filter.filter,
                      value: e.target.value,
                    })
                  )
                }
                startAdornment={
                  screenerState.setFilters.hasOwnProperty(filter.filter) ? (
                    <IconButton
                      className="clear-button-icon-screener-select-field"
                      sx={{
                        display: screenerState.setFilters.hasOwnProperty(
                          filter.filter
                        )
                          ? ""
                          : "none",
                      }}
                      onClick={(e) => {
                        dispatch(
                          remvSetFilter({
                            property: filter.filter,
                          })
                        );
                      }}>
                      <CloseIcon />
                    </IconButton>
                  ) : (
                    <></>
                  )
                }>
                {filter.filterOptions.map((filterOption) => {
                  return (
                    <MenuItem value={filterOption} key={filterOption}>
                      {filterOption}
                    </MenuItem>
                  );
                })}
                {/* <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem> */}
              </Select>
            </FormControl>
          );
        })}
      </div>
    </div>
  );
}

export default Filters;
