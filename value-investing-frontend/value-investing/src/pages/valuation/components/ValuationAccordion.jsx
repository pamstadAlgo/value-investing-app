import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionTitle from "./AccordionTitle";
import AccordionBodyEpv from "./AccordionBodyEpv";
import AccordionBodyAssetVal from "./AccordionBodyAssetVal";

function ValuationAccordion({ epvData, qfsSymbol, valuationMethod }) {
  return (
    <Accordion className="custom-accordion">
      <AccordionTitle qfsSymbol={qfsSymbol} />
      {valuationMethod === "epv" && (
        <AccordionBodyEpv data={epvData} qfsSymbol={qfsSymbol} />
      )}
      {valuationMethod === "av" && <AccordionBodyAssetVal />}
    </Accordion>
  );
}

export default ValuationAccordion;
