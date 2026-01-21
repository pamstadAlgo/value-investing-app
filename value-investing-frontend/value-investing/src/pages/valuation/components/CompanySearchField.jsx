import React, { useState } from "react";
import TickerAutoComplete from "./TickerAutoComplete";
import * as Yup from "yup";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { Button } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import {
  initializeAssetValuations,
  initializeEPVValuations,
  initializePenmanValuations,
} from "../../../features/valuationSlice";
import { useSnackbar } from "../../GlobalComponents/SnackbarProvider";

function CompanySearchField() {
  const valuationState = useSelector((state) => state.valuation);
  // const [openBackdrop, setBackdropOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useSnackbar();

  //   const handleSubmit = () => {};
  const axiosInstanceAuth = useAxiosWithAuth();
  const dispatch = useDispatch();

  const initialValues = {
    tickers:
      valuationState.selectedTickerSymbols?.length > 0 ? "non-empty" : "",
  };

  const validationSchema = Yup.object({
    tickers: Yup.string().required("Ticker symbol is required"),
  });

  return (
    <div className="glass-card" style={{ marginBottom: "32px" }}>
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Select companies
      </div>
      {/* <TickerAutoComplete /> */}
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          setLoading(true);
          // extract tickers
          const qfs_symbols = valuationState.selectedTickerSymbols.map(
            (tickerObject) => tickerObject.qfs_symbol
          );

          // prepare request body for EPV calculation
          const requestBody = {
            qfs_symbols: qfs_symbols,
            // years_op_margin: values.operatingMarginYears,
            // years_avg_revenue: values.revenueMarginYears,
          };

          //prepare request body for equity value calculation
          const requestBodyPenman = {
            qfs_symbols: qfs_symbols,
            years_eps: values.epsAvgYears,
          };

          axiosInstanceAuth
            .post("/screener/epv-fundamentals/", requestBody)
            .then((response) => {
              console.log("response.data epv fundamentals: ", response.data);
              //   dispatch(setEpvData(response.data));
              dispatch(initializeEPVValuations(response.data));
              showMessage("Computed EPV successfully", "success");
            })
            .catch((error) => {
              showMessage(`Error computing EPV ${error}`, "error");
              // setBackdropOpen(false);
              console.error("ERROR: POST /screener/compute-epv/: ", error);
            });

          //make request for asset valuation
          axiosInstanceAuth
            .post("/screener/asset-val-fundamentals/", requestBody)
            .then((response) => {
              dispatch(initializeAssetValuations(response.data));
            })
            .catch((error) => {
              showMessage(`Error computing asset val ${error}`, "error");

              console.error(
                "ERROR: POST /screener/asset-val-fundamentals/: ",
                error
              );
            });

          // make request for penman valuation
          axiosInstanceAuth
            .post("/screener/penman-fundamentals/", requestBody)
            .then((response) => {
              dispatch(initializePenmanValuations(response.data));
              // dispatch(initializeAssetValuations(response.data));
              setLoading(false);
            })
            .catch((error) => {
              showMessage(`Error computing penman val ${error}`, "error");
              setLoading(false);

              // setBackdropOpen(false);
              console.error(
                "ERROR: POST /screener/penman-fundamentals/: ",
                error
              );
            });

          // axiosInstanceAuth
          //   .post("/screener/equity-value-penman/", requestBodyPenman)
          //   .then((response) => {
          //     console.log("response.data equity penman: ", response.data);
          //     //   dispatch(setPenmanEquityValue(response.data));
          //     setBackdropOpen(false);
          //   })
          //   .catch((error) => {
          //     console.error(
          //       "ERROR: POST /screener/equity-value-penman/: ",
          //       error
          //     );
          //     setBackdropOpen(false);
          //   });
        }}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <TickerAutoComplete formik={formik} />
            {/* <div style={{ display: "flex", gap: "16px" }}>
                        <FormControl
                          sx={{ width: "50%", marginTop: "16px" }}
                          error={
                            formik?.errors.operatingMarginYears &&
                            formik?.touched.operatingMarginYears
                              ? true
                              : false
                          }>
                          <InputLabel id="demo-simple-select-label">
                            Operating Margin Years
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                              formik?.values.operatingMarginYears
                                ? formik?.values.operatingMarginYears
                                : ""
                            }
                            name="operatingMarginYears"
                            label="Operating Margin Years"
                            onChange={formik.handleChange}>
                            {nrYears.map((item) => {
                              return <MenuItem value={item}>{item}</MenuItem>;
                            })}
                          </Select>
                          <FormHelperText>
                            {formik?.errors.operatingMarginYears &&
                            formik?.touched.operatingMarginYears
                              ? formik?.errors.operatingMarginYears
                              : " "}
                          </FormHelperText>
                        </FormControl>
                        <FormControl
                          sx={{ width: "50%", marginTop: "16px" }}
                          error={
                            formik?.errors.revenueMarginYears &&
                            formik?.touched.revenueMarginYears
                              ? true
                              : false
                          }>
                          <InputLabel id="demo-simple-select-label">
                            Revenue Years
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                              formik?.values.revenueMarginYears
                                ? formik?.values.revenueMarginYears
                                : ""
                            }
                            name="revenueMarginYears"
                            label="Revenue Years"
                            onChange={formik.handleChange}>
                            {nrYears.map((item) => {
                              return <MenuItem value={item}>{item}</MenuItem>;
                            })}
                          </Select>
                          <FormHelperText>
                            {formik?.errors.revenueMarginYears &&
                            formik?.touched.revenueMarginYears
                              ? formik?.errors.revenueMarginYears
                              : " "}
                          </FormHelperText>
                        </FormControl>
                        <FormControl
                          sx={{ width: "50%", marginTop: "16px" }}
                          error={
                            formik?.errors.epsAvgYears && formik?.touched.epsAvgYears
                              ? true
                              : false
                          }>
                          <InputLabel id="demo-simple-select-label">
                            EPS Years (Avg)
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                              formik?.values.epsAvgYears ? formik?.values.epsAvgYears : ""
                            }
                            name="epsAvgYears"
                            label="EPS Years (Avg)"
                            onChange={formik.handleChange}>
                            {nrYears.map((item) => {
                              return <MenuItem value={item}>{item}</MenuItem>;
                            })}
                          </Select>
                          <FormHelperText>
                            {formik?.errors.epsAvgYears && formik?.touched.epsAvgYears
                              ? formik?.errors.epsAvgYears
                              : " "}
                          </FormHelperText>
                        </FormControl>
                      </div> */}
            <div className="flex-wrapper-submit-button-valuation">
              <Button
                type="submit"
                variant="contained"
                className="contained-custom-button fit-content-button"
                startIcon={
                  loading ? (
                    <CircularProgress
                      className="custom-circular-progress"
                      style={{ width: "20px", height: "20px" }}
                    />
                  ) : (
                    <AttachMoneyOutlinedIcon className="button-icon" />
                  )
                }>
                Value companies
              </Button>
              {/* <Button
                variant="contained"
                type="submit"
                //   disabled={valuationState?.selectedTickerSymbols.length === 0}
              >
                Submit
              </Button> */}
            </div>
          </form>
        )}
      </Formik>
      {/* <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openBackdrop}
        // onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}
    </div>
  );
}

export default CompanySearchField;
