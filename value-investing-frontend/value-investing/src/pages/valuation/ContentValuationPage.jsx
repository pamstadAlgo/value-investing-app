import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import NavBar from "../GlobalComponents/NavBar";
import TickerAutoComplete from "./components/TickerAutoComplete";
import ValuationForm from "./components/ValuationForm";
import ValuationCard from "./components/ValuationCard";
import { useSelector } from "react-redux";
import LineGraph from "./components/LineGraph";

function ContentValuationPage() {
  const valuationState = useSelector((state) => state.valuation);

  return (
    <>
      <NavBar />
      <div className="content-wrapper">
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
        {/* <TickerAutoComplete /> */}
      </div>
      {/* <LineGraph /> */}
    </>
  );
}

export default ContentValuationPage;
