import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from "../../../axios/axiosConfig";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FilteredStockDetails from "./FilteredStockDetails";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { addGrowthRatesForTicker } from "../../../features/stockScreenerSlice";

function Row(props) {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [growthRateData, setGrowthRateData] = useState([]);
  const dispatch = useDispatch();

  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const handleOpenStockDetails = () => {
    if (open === false) {
      // fetch data of ticker of interest
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            //   onClick={() => setOpen(!open)}
            onClick={() => {
              if (open === false) {
                // check if growth rates were already fetched for this day
                if (
                  screenerState.growthRatesPerTicker.date !==
                    moment().format("DD-MM-YYYY") ||
                  screenerState.growthRatesPerTicker.hasOwnProperty(
                    row.ticker
                  ) === false
                ) {
                  // fetch ratios for ticker whose tab has been opened
                  axiosInstance
                    .get("/screener/growth-rates/", {
                      params: { ticker: row.ticker },
                    })
                    .then((response) => {
                      dispatch(
                        addGrowthRatesForTicker({
                          ticker: row.ticker,
                          growthRates: response.data,
                        })
                      );
                      setGrowthRateData(response.data);
                      setOpen(true);
                    })
                    .catch((error) => {
                      console.error("error GET /screener/growth-rates/: ", error);
                    });
                } else {
                  setOpen(true);
                  setGrowthRateData(
                    screenerState.growthRatesPerTicker[row.ticker]
                  );
                }
              } else {
                setOpen(false);
              }
            }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.ticker}
        </TableCell>
        <TableCell align="right">{row.company}</TableCell>
        <TableCell align="right">{row.sector}</TableCell>
        <TableCell align="right">{row.industry}</TableCell>
        <TableCell align="right">{row.country}</TableCell>
        <TableCell align="right">{row.marketCap}</TableCell>
        <TableCell align="right">{row.pe}</TableCell>
        <TableCell align="right">{row.price}</TableCell>
        <TableCell align="right">{row.change}</TableCell>
        <TableCell align="right">{row.volume}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <h1>{`HELLO WORLD HERE COMES TICKER DATA OF ${row.ticker}`}</h1>
            <FilteredStockDetails data={growthRateData} />

            {/* <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function FilteredStocks(props) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Ticker</TableCell>
            <TableCell align="right">Company</TableCell>
            <TableCell align="right">Sector</TableCell>
            <TableCell align="right">Industry</TableCell>
            <TableCell align="right">Country</TableCell>
            <TableCell align="right">Market Cap</TableCell>
            <TableCell align="right">P/E</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell align="right">Volume</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row) => (
            <Row key={row.ticker} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    // <Accordion>
    //   <AccordionSummary
    //     expandIcon={<ExpandMoreIcon />}
    //     aria-controls="panel1a-content"
    //     id="panel1a-header">
    //     <Typography>Accordion 1</Typography>
    //   </AccordionSummary>
    //   <AccordionDetails>
    //     <Typography>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
    //       malesuada lacus ex, sit amet blandit leo lobortis eget.
    //     </Typography>
    //   </AccordionDetails>
    // </Accordion>
  );
}

export default FilteredStocks;
