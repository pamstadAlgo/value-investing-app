import React, { useEffect, useState } from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PriceTag from "./PriceTag";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { computeEpvPerShare, computeEquityPerShare } from "./selectorFunctions";

export function useLastClosePrice(qfsSymbol, axiosInstance) {
  return useQuery({
    queryKey: ["lastClosePrice", qfsSymbol],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `screener/last-close-price/${qfsSymbol}/`
      );
      return response.data;
    },
    // staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

function AccordionTitle({ qfsSymbol }) {
  const axiosInstanceAuth = useAxiosWithAuth();
  const [compInfo, setCompInfo] = useState({});
  const epvPerShareBase = useSelector((state) =>
    computeEpvPerShare(
      state.valuation.epvValuations?.find(
        (item) => Object.keys(item)[0] === qfsSymbol
      ),
      qfsSymbol,
      1
    )
  );

  const equityPerShare = useSelector((state) =>
    computeEquityPerShare(
      state.valuation.assetValuations?.find(
        (item) => item.qfsSymbol === qfsSymbol
      )
    )
  );

  const { data, isLoading } = useLastClosePrice(qfsSymbol, axiosInstanceAuth);

  if (isLoading) return;

  // const epvBase = useSelector((state) => )

  // var lastClosePrice;

  // useEffect(() => {
  //   axiosInstanceAuth
  //     .get(`screener/last-close-price/${qfsSymbol}/`)
  //     .then((response) => {
  //       setCompInfo(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("ERROR: GET screener/last-close-price/: ", error);
  //     });
  // }, []);

  return (
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1-content"
      id="panel1-header">
      <div className="accordion-title-flexbox-wrapper">
        <div className="accordion-ticker-title">
          {data?.name}{" "}
          <span className="accordion-title-qfs-symbol">
            ({qfsSymbol}, Currency: {data?.currency})
          </span>{" "}
        </div>
        <div className="price-tag-wrapper">
          <PriceTag
            title="Last Close Price"
            currencyCode={data?.currency}
            price={data?.lastClosePrice?.toFixed(2)}
            colorPrice="neutral"
          />
          <PriceTag
            title="Asset Price"
            currencyCode={data?.currency}
            price={equityPerShare?.toFixed(2)}
            colorPrice={
              equityPerShare > data?.lastClosePrice
                ? "undervalued"
                : "overvalued"
            }
          />
          <PriceTag
            currencyCode={data?.currency}
            title="EPV (base case)"
            price={epvPerShareBase?.toFixed(2)}
            colorPrice={
              epvPerShareBase > data?.lastClosePrice
                ? "undervalued"
                : "overvalued"
            }
          />
        </div>
      </div>
    </AccordionSummary>
  );
}

export default AccordionTitle;
