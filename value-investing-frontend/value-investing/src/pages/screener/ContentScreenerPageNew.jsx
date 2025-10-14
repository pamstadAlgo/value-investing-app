import React from "react";
import NavBar from "../GlobalComponents/NavBar";
import ScreenerTemplates from "./components/ScreenerTemplates";
import Screener from "./components/Screener";
import Fab from "@mui/material/Fab";
import FilterFloatingButton from "./components/FilterFloatingButton";

function ContentScreenerPageNew() {
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
