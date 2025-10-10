import React from "react";
import NavBar from "../GlobalComponents/NavBar";
import ScreenerTemplates from "./components/ScreenerTemplates";
import Screener from "./components/Screener";

function ContentScreenerPageNew() {
  return (
    <>
      <NavBar />
      <main className="main-content-wrapper">
        <div className="flex-wrapper-main-content">
          <div className="title-section" style={{ marginBottom: "3rem" }}>
            <div className="title">Stock Screener</div>
            <div className="sub-title" style={{ marginTop: "6px" }}>
              Filter stocks to find your next winning investment.
            </div>
          </div>
          <ScreenerTemplates />
          <Screener />
          <div>ContentScreenerPageNew</div>
        </div>
      </main>
    </>
  );
}

export default ContentScreenerPageNew;
