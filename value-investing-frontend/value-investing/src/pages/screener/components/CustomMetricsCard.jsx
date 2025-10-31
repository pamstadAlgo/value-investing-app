import React, { useEffect, useState } from "react";
import CustomMetrics from "./CustomMetrics";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import CustomMetricsList from "./CustomMetricsList";
import { useSnackbar } from "../../GlobalComponents/SnackbarProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeCustomMetrics,
  setRefetchFilterQuantities,
} from "../../../features/stockScreenerSlice";

function CustomMetricsCard() {
  //fetch all existing custom metrics for given user
  // const [customMetrics, setCustomMetrics] = useState([]);
  const screenerState = useSelector((state) => state.stockscrenner);

  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();
  const { showMessage } = useSnackbar();

  const handleMetricDelete = (e, id) => {
    console.log("we clicked button, e.target.value: ", id);
    e.stopPropagation();

    axiosInstanceAuth
      .delete("/screener/custom-metrics/", {
        data: { id: id },
      })
      .then((response) => {
        // dispatch(setSavedFilterViews(response.data));
        dispatch(initializeCustomMetrics(response.data));
        showMessage("Custom metric successfully deleted", "success");

        dispatch(
          setRefetchFilterQuantities(!screenerState.refetchFilterQuantities)
        );
      })
      .catch((error) => {
        showMessage("Error deleting custom metric", "error");
        console.error("ERROR: DELETE /screener/filter-view/ ", error);
      });
  };

  useEffect(() => {
    axiosInstanceAuth
      .get("screener/custom-metrics/")
      .then((response) => {
        console.log("custom metrics response.data: ", response.data);
        dispatch(initializeCustomMetrics(response.data));
        // setCustomMetrics(response.data);
      })
      .catch((error) => {
        console.error("ERROR: GET screener/custom-metrics//: ", error);
      });
  }, []);

  return (
    <div className="glass-card">
      <div className="title-mid-size" style={{ marginBottom: "10px" }}>
        Custom Metrics
      </div>
      <div className="flex-wrapper-filter-views-compo custom-list">
        {/* <SavedFilterViews />
        <SaveView /> */}
        {screenerState?.customMetrics.length > 2 ? (
          <CustomMetricsList
            customMetrics={screenerState.customMetrics}
            handleMetricDelete={handleMetricDelete}
          />
        ) : (
          <div className="no-custom-metrics-element">No custom metrics </div>
        )}
        <CustomMetrics />
      </div>
    </div>
  );
}

export default CustomMetricsCard;
