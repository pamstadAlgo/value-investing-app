import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionTitle from "./AccordionTitle";
import AccordionBodyEpv from "./AccordionBodyEpv";
import AccordionBodyAssetVal from "./AccordionBodyAssetVal";
import { useSelector } from "react-redux";

function ValuationAccordion({ epvData, qfsSymbol, valuationMethod }) {
  //extract asset valuation data
  const assetValuations = useSelector(
    (state) => state.valuation.assetValuations
  );
  var data;
  var periodEndDate;

  // get asset val data for given qfsSymbol
  const assetVal = assetValuations.find((item) => item.qfsSymbol === qfsSymbol);

  if (assetVal) {
    data = assetVal["data"];
    periodEndDate = assetVal["periodEndDate"];
  } else {
    data = [];
    periodEndDate = "";
  }

  console.log("data that we pass: ", data);
  console.log("assetVal: ", assetVal);

  return (
    <Accordion className="custom-accordion">
      <AccordionTitle qfsSymbol={qfsSymbol} />
      {valuationMethod === "epv" && (
        <AccordionBodyEpv data={epvData} qfsSymbol={qfsSymbol} />
      )}
      {valuationMethod === "av" && (
        <AccordionBodyAssetVal
          data={data}
          qfsSymbol={qfsSymbol}
          reportingDate={periodEndDate}
        />
      )}
    </Accordion>
  );
}

export default ValuationAccordion;
