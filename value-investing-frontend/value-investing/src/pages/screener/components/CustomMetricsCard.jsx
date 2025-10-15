import React, { useEffect, useState } from "react";
import CustomMetrics from "./CustomMetrics";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import CustomMetricsList from "./CustomMetricsList";

function CustomMetricsCard() {
  //fetch all existing custom metrics for given user
  const [customMetrics, setCustomMetrics] = useState([]);
  const axiosInstanceAuth = useAxiosWithAuth();

  useEffect(() => {
    axiosInstanceAuth
      .get("screener/custom-metrics/")
      .then((response) => {
        console.log("custom metrics response.data: ", response.data);
        setCustomMetrics(response.data);
        // dispatch(initializeMccProfiles(response.data));
        // console.log("resonse microcap clubs: ", response.data);
      })
      .catch((error) => {
        console.error("ERROR: GET screener/custom-metrics//: ", error);
      });
  }, []);
  return (
    <div className="glass-card" style={{ marginBottom: "1rem" }}>
      <div className="title-mid-size" style={{ marginBottom: "10px" }}>
        Custom Metrics
      </div>
      <div className="flex-wrapper-filter-views-compo">
        {/* <SavedFilterViews />
        <SaveView /> */}
        <CustomMetricsList />
        <CustomMetrics />
      </div>
    </div>
  );
}

export default CustomMetricsCard;
