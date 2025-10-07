import React from "react";
import TickerAutoComplete from "./TickerAutoComplete";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Formik } from "formik";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import {
  setEpvData,
  setPenmanEquityValue,
} from "../../../features/valuationSlice";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const nrYears = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ValuationForm() {
  const valuationState = useSelector((state) => state.valuation);
  const [openBackdrop, setBackdropOpen] = React.useState(false);

  //   const handleSubmit = () => {};
  const axiosInstanceAuth = useAxiosWithAuth();
  const dispatch = useDispatch();

  const initialValues = {
    tickers:
      valuationState.selectedTickerSymbols?.length > 0 ? "non-empty" : "",
    operatingMarginYears: 5,
    revenueMarginYears: 5,
    epsAvgYears: 3,
  };

  const validationSchema = Yup.object({
    tickers: Yup.string().required("Metric Name is required"),
    operatingMarginYears: Yup.number()
      .integer()
      .required("Metric Description is required"),
    revenueMarginYears: Yup.number()
      .integer()
      .required("Metric Description is required"),
  });

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          setBackdropOpen(true);
          // extract tickers
          const qfs_symbols = valuationState.selectedTickerSymbols.map(
            (tickerObject) => tickerObject.qfs_symbol
          );

          // prepare request body for EPV calculation
          const requestBody = {
            qfs_symbols: qfs_symbols,
            years_op_margin: values.operatingMarginYears,
            years_avg_revenue: values.revenueMarginYears,
          };

          //prepare request body for equity value calculation
          const requestBodyPenman = {
            qfs_symbols: qfs_symbols,
            years_eps: values.epsAvgYears,
          };

          axiosInstanceAuth
            .post("/screener/compute-epv/", requestBody)
            .then((response) => {
              console.log("response.data epv: ", response.data);
              dispatch(setEpvData(response.data));
            })
            .catch((error) =>
              console.error("ERROR: POST /screener/compute-epv/: ", error)
            );

          axiosInstanceAuth
            .post("/screener/equity-value-penman/", requestBodyPenman)
            .then((response) => {
              // console.log("response.data epv: ", response.data);
              dispatch(setPenmanEquityValue(response.data));
              setBackdropOpen(false);
            })
            .catch((error) => {
              console.error(
                "ERROR: POST /screener/equity-value-penman/: ",
                error
              );
              setBackdropOpen(false);
            });
        }}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <TickerAutoComplete formik={formik} />
            <div style={{ display: "flex", gap: "16px" }}>
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
            </div>
            <div className="flex-wrapper-submit-button-valuation">
              <Button
                variant="contained"
                type="submit"
                //   disabled={valuationState?.selectedTickerSymbols.length === 0}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openBackdrop}
        // onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default ValuationForm;
