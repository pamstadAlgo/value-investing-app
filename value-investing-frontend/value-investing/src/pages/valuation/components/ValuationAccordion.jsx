import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import AccordionTitle from "./AccordionTitle";
import AccordionBodyEpv from "./AccordionBodyEpv";
function ValuationAccordion() {
  return (
    <Accordion className="custom-accordion">
      <AccordionTitle />
      <AccordionBodyEpv />
    </Accordion>
  );
}

export default ValuationAccordion;
