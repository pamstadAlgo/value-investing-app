import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import NavBar from "../GlobalComponents/NavBar";
import TickerAutoComplete from "./components/TickerAutoComplete";
import ValuationForm from "./components/ValuationForm";
import ValuationCard from "./components/ValuationCard";
import { useSelector } from "react-redux";
import LineGraph from "./components/LineGraph";
import CompanySearchField from "./components/CompanySearchField";
import CompanyValuation from "./components/CompanyValuation";

function ContentValuationPage() {
  const valuationState = useSelector((state) => state.valuation);

  return (
    <>
      <NavBar />
      <main className="main-content-wrapper relative-position">
        <div className="flex-wrapper-main-content">
          <div className="title-section" style={{ marginBottom: "3rem" }}>
            <div className="title">Stock Valuation</div>
            <div className="sub-title" style={{ marginTop: "6px" }}>
              Value stocks to find your next winning investment.
            </div>
          </div>
          <CompanySearchField />
          <CompanyValuation />

          {/* <ValuationForm />
          <div style={{ marginTop: "32px" }}>
            {valuationState.epvData.map((valuationItem) => {
              //find the penmanEquityValue Object
              const penmanEquityObject = valuationState.equityValuePenman.find(
                (equityObj) => equityObj.ticker === valuationItem.ticker
              );

              return (
                <ValuationCard
                  epvObject={valuationItem}
                  penmanObject={penmanEquityObject}
                />
              );
            })}
          </div> */}
        </div>
      </main>
      {/* <div className="content-wrapper">
        <div className="flex-wrapper-screener-title-section">
          <h1>Valuation</h1>
        </div>
        <ValuationForm />
        <div style={{ marginTop: "32px" }}>
          {valuationState.epvData.map((valuationItem) => {
            //find the penmanEquityValue Object
            const penmanEquityObject = valuationState.equityValuePenman.find(
              (equityObj) => equityObj.ticker === valuationItem.ticker
            );

            return (
              <ValuationCard
                epvObject={valuationItem}
                penmanObject={penmanEquityObject}
              />
            );
          })}
        </div>
      </div> */}
    </>
  );
}

export default ContentValuationPage;
