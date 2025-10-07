import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LineGraph from "./LineGraph";
import EPVValuation from "./EPVValuation";
import EquityPenmanValuation from "./EquityPenmanValuation";

function ValuationCard({ epvObject, penmanObject }) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header">
        <div className="flex-wrapper-valuation-title">
          <div className="accordion-title">
            {epvObject.qfs_symbol} - {epvObject.name}
          </div>
          <div className="valuation-chip-wrapper" >
            <div className="valuation-status-chip">
              <div className="chip-title">
                EPV <span className="chip-subscript">(TTM)</span>{" "}
              </div>
              <div
                className="circle-symbol"
                style={{
                  backgroundColor:
                    epvObject.epv_per_share_ttm > epvObject.current_price
                      ? "green"
                      : "red",
                }}
              />
            </div>
            <div className="valuation-status-chip">
              <div className="chip-title">
                EPV <span className="chip-subscript">(avg)</span>{" "}
              </div>
              <div
                className="circle-symbol"
                style={{
                  backgroundColor:
                    epvObject.epv_per_share > epvObject.current_price
                      ? "green"
                      : "red",
                }}
              />
            </div>
            <div className="valuation-status-chip">
              <div className="chip-title">
                Equity <span className="chip-subscript">(TTM)</span>{" "}
              </div>
              <div
                className="circle-symbol"
                style={{
                  backgroundColor:
                    penmanObject?.equity_value_per_share_ttm >
                    penmanObject?.current_price
                      ? "green"
                      : "red",
                }}
              />
            </div>
            <div className="valuation-status-chip">
              <div className="chip-title">
                Equity <span className="chip-subscript">(avg)</span>{" "}
              </div>
              <div
                className="circle-symbol"
                style={{
                  backgroundColor:
                    penmanObject?.equity_value_per_share >
                    penmanObject?.current_price
                      ? "green"
                      : "red",
                }}
              />
            </div>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <EPVValuation epvObject={epvObject} />
        <EquityPenmanValuation penmanObject={penmanObject} />
      </AccordionDetails>
    </Accordion>
  );
}

export default ValuationCard;
