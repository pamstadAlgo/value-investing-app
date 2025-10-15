import React, { useEffect } from "react";
import NavBar from "../GlobalComponents/NavBar";
import ScreenerTemplates from "./components/ScreenerTemplates";
import Screener from "./components/Screener";
import Fab from "@mui/material/Fab";
import FilterFloatingButton from "./components/FilterFloatingButton";
import useAxiosWithAuth from "../../axios/useAxiosWithAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  initalizeAutocompleteFilters,
  initalizeFilters,
  setCharFieldOptions,
  setSavedFilterViews,
} from "../../features/stockScreenerSlice";

function ContentScreenerPageNew() {
  const screenerState = useSelector((state) => state.stockscrenner);

  const axiosInstanceAuth = useAxiosWithAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    axiosInstanceAuth
      .get("/screener/filter-quantities/")
      .then((response) => {
        dispatch(initalizeFilters(response.data));

        //create filter quantities for autocomplete field
        let autoCompleteFilters = [];

        for (var i = 0; i < response.data?.length; i++) {
          autoCompleteFilters.push(...response.data[i].tableColumns);
        }

        dispatch(initalizeAutocompleteFilters(autoCompleteFilters));
      })
      .catch((error) => {
        console.error("ERROR: GET /screener/filter-quantities/ ");
      });
  }, [screenerState.refetchFilterQuantities]);

  useEffect(() => {
    //get saved filter views
    axiosInstanceAuth
      .get("screener/filter-view/")
      .then((response) => {
        dispatch(setSavedFilterViews(response.data));
      })
      .catch((error) => {
        console.error("ERROR: GET screener/filter-view/");
      });

    //get select options for char fields
    axiosInstanceAuth
      .get("screener/charfield-filter-options/")
      .then((response) => {
        dispatch(setCharFieldOptions(response.data));
      })
      .catch((error) => {
        console.error("ERROR: GET screener/charfield-filter-options/: ", error);
      });
  }, []);

  return (
    <>
      <NavBar />
      <main className="main-content-wrapper relative-position">
        <div className="flex-wrapper-main-content">
          <div className="title-section" style={{ marginBottom: "3rem" }}>
            <div className="title">Stock Screener</div>
            <div className="sub-title" style={{ marginTop: "6px" }}>
              Filter stocks to find your next winning investment.
            </div>
          </div>
          <ScreenerTemplates />
          <Screener />
        </div>
        <FilterFloatingButton />
      </main>
    </>
  );
}

export default ContentScreenerPageNew;
