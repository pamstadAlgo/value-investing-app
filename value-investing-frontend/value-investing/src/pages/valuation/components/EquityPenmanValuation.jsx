import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ValuationSubCard from "./ValuationSubCard";
import LineGraph from "./LineGraph";

function EquityPenmanValuation({ penmanObject }) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="child-accordion-title"> Equity (Penman) Valuation </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="section-title">Prices</div>
        <div className="flexwrapper-price-details">
          <ValuationSubCard
            title="Equity per share (TTM)"
            value={penmanObject?.equity_value_per_share_ttm}
            currency={penmanObject?.currency}
            rounding={2}
          />
          <ValuationSubCard
            title="Equity per share"
            value={penmanObject?.equity_value_per_share}
            currency={penmanObject?.currency}
            rounding={2}
          />
          <ValuationSubCard
            title="Current Price"
            value={penmanObject?.current_price}
            currency={penmanObject?.currency}
            rounding={2}
          />
        </div>
        {/* <div className="line-graph-wrapper">
          <div className="graph-title">
            <div>ROCE</div>
          </div>
          <LineGraph
            data={[
              {
                id: "roce",
                data: penmanObject?.roce,
              },
            ]}
          />
        </div> */}
        <div className="line-graph-wrapper">
          <div className="graph-title">
            <div>EPS</div>
          </div>
          <LineGraph
            data={[
              {
                id: "eps",
                data: penmanObject?.eps ? penmanObject.eps : [],
              },
            ]}
            sender="penman"
          />
        </div>
        {/*<div className="line-graph-wrapper">
          <div className="graph-title">
            <div>Book Value</div>
          </div>
          <LineGraph
            data={[
              {
                id: "bookValue",
                data: penmanObject?.book_value,
              },
            ]}
          />
        </div>
        <div className="line-graph-wrapper">
          <div className="graph-title">
            <div>Implied EPS Growth Rate</div>
          </div>
          <LineGraph
            yMin={0}
            yMax={1}
            data={[
              {
                id: "epsGrowthRate",
                data: penmanObject?.implied_eps_growth_rate,
              },
            ]}
          />
        </div>
        <div className="line-graph-wrapper">
          <div className="graph-title">
            <div>Implied EPS Growth Rate (TTM)</div>
          </div>
          <LineGraph
            yMin={0}
            yMax={1}
            data={[
              {
                id: "epsGrowthRateTTM",
                data: penmanObject?.implied_eps_growth_rate_ttm,
              },
            ]}
          />
        </div> */}
      </AccordionDetails>
    </Accordion>
  );
}

export default EquityPenmanValuation;
