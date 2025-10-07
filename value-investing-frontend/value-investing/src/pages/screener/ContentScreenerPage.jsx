import React, { useEffect, useState, useRef } from "react";
import NavBar from "../GlobalComponents/NavBar";
import Filters from "./components/Filters";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import FilteredStocks from "./components/FilteredStocks";
import axiosInstance from "../../axios/axiosConfig";
import { initalizeTickerSymbols } from "../../features/keyRatiosSlice";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
// import { MathJax, MathJaxContext } from "better-react-mathjax";
import * as math from "mathjs";
import { BlockMath, InlineMath } from "react-katex";
// import {} from "react-katex";
import "katex/dist/katex.min.css";
import { useCookies } from "react-cookie";
import useAxiosWithAuth from "../../axios/useAxiosWithAuth";
import {
  initalizeAutocompleteFilters,
  initalizeFilters,
  setCharFieldOptions,
  setSavedFilterViews,
} from "../../features/stockScreenerSlice";
import ActivFilter from "./components/ActivFilter";
import SavedFilterViews from "./components/SavedFilterViews";
// import SaveFilterViewModal from "./components/SaveFilterViewModal";
import SaveView from "./SaveView";
import DataView from "./components/DataView";

function ContentScreenerPage() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const keyRatiosState = useSelector((state) => state.keyratios);
  const [openBackdropLoading, setOpenBackdropLoading] = useState(false);
  const [backdropLoadingText, setBackdropLoadingText] = useState("");
  const [formula, setFormula] = useState("(a - b)/n");
  const [blurCursorPosition, setBlurCursorPosition] = useState(0);
  const [cookies] = useCookies(["access_token"]);
  const [isFilterViewModalOpen, setIsFilterViewModalOpen] = useState(false);

  const axiosInstanceAuth = useAxiosWithAuth();

  const handleFilterViewModalClose = () => {
    setIsFilterViewModalOpen(false);
  };

  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [exampleInput, setExampleInput] = useState([
    "(",
    "a",
    "-",
    "longerVariable",
    ")",
    ")",
  ]);
  const allowedKeyStrokes = [
    "(",
    ")",
    "*",
    "/",
    "+",
    "-",
    "Backspace",
    "ArrowLeft",
    "ArrowRight",
  ];

  const toLatex = (input) => {
    try {
      const parsed = math.parse(input); // Parse the formula
      return parsed.toTex(); // Convert to LaTeX
    } catch (error) {
      return "Invalid formula";
    }
  };

  // useEffect hook that gets all available symbols for trading
  useEffect(() => {
    // only fetch ticker symbols if not present in cache
    if (keyRatiosState.tickerSymbols.length === 0) {
      setOpenBackdropLoading(true);
      setBackdropLoadingText("Loading ticker symbols ...");
      // axiosInstance
      //   .get("/fmp/ticker-symbols/")
      //   .then((response) => {
      //     dispatch(initalizeTickerSymbols(response.data));
      //     setOpenBackdropLoading(false);
      //   })
      //   .catch((error) => {
      //     setOpenBackdropLoading(false);
      //     console.error(
      //       `ERROR ContentValuationPage, GET ${error.url}, message: ${error.message}: `
      //     );
      //   });
    }
  }, []);

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
      <div className="content-wrapper">
        <div className="flex-wrapper-screener-title-section">
          <h1>Stock Screener</h1>{" "}
          <div className="flex-item-saved-filters">
            {" "}
            {/* <SaveView /> */}
            <SavedFilterViews />
          </div>{" "}
        </div>
        <Filters />
        <DataView />
      </div>
      {/* <SaveFilterViewModal
        isOpen={isFilterViewModalOpen}
        handleClose={handleFilterViewModalClose}
      /> */}
    </>
    // </MathJaxContext>
  );
}

export default ContentScreenerPage;
