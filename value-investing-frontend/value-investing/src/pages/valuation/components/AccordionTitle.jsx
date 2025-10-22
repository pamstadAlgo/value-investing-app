import React from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PriceTag from "./PriceTag";

function AccordionTitle({ qfsSymbol }) {
  return (
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1-content"
      id="panel1-header">
      <div className="accordion-title-flexbox-wrapper">
        <div className="accordion-ticker-title">{qfsSymbol}</div>
        <div className="price-tag-wrapper">
          <PriceTag title="Current Price" price="150.75" colorPrice="neutral" />
          <PriceTag title="Asset Price" price="200" colorPrice="undervalued" />
          <PriceTag title="EPV" price="250.75" colorPrice="overvalued" />
        </div>
      </div>
    </AccordionSummary>
  );
}

export default AccordionTitle;
