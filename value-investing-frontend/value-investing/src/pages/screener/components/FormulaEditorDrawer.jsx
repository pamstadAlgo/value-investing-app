import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import TextField from "@mui/material/TextField";
import {
  setCustomMetricDescription,
  setCustomMetricName,
} from "../../../features/stockScreenerSlice";
import FormulaEditorMonaco from "./FormulaEditorMonaco";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

function FormulaEditorDrawer({ open, handleClose }) {
  const screenerState = useSelector((state) => state.stockscrenner);
  const dispatch = useDispatch();
  const [errorFormula, setErrorFormula] = useState(false);

  const validationSchema = Yup.object({
    metricName: Yup.string().required("Metric Name is required"),
    metricDescription: Yup.string().required("Metric Description is required"),
    formulaEditor: Yup.string()
      .test("custom-validation", "Formula is invalid", (value) => {
        // Your custom validation logic for field3
        if (errorFormula) {
          return false;
        } else {
          return true;
        }
        // try {
        //   let customValidation = validateFormula(
        //     screenerState.formulaInnerHtml
        //   );
        //   if (!customValidation) {
        //     throw new Error("customValidation Failed");
        //   }
        //   const parsed = math.parse(screenerState.formula); // Parse the formula
        //   var texFormat = parsed.toTex(); // Convert to LaTeX
        //   return true;
        // } catch (error) {
        //   console.error("error toLatex: ", error);
        //   return false;
        // }
      })
      .required("Formula is required"),
  });

//   const initialValues = {
//     metricName: screenerState.customMetricName,
//     metricDescription: screenerState.customMetricDescription,
//     formulaEditor: screenerState.formula,
//   };

  const initialValues = {
    metricName: "",
    metricDescription: "",
    formulaEditor: "",
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="top"
      className="custom-drawer">
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Create custom Filter
      </div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log("we submit these values: ", values);

          const payload = {
            tech_name: screenerState.formula,
            readable_name: screenerState.customMetricName,
            description: screenerState.customMetricDescription,
            html_formula: screenerState.formulaInnerHtml,
          };

          //   axiosInstanceAuth
          //     .post("/screener/custom-metrics/", payload)
          //     .then((response) => {
          //       dispatch(
          //         setRefetchFilterQuantities(
          //           !screenerState.refetchFilterQuantities
          //         )
          //       );
          //       //fetch again all metrics
          //     })
          //     .catch((error) => {
          //       console.error("ERROR: POST /screener/custom-metrics/: ", error);
          //     });
        }}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <div className="metric-description-flex-wrapper">
              <TextField
                label="Metric Name"
                variant="outlined"
                name="metricName"
                helperText={
                  formik?.errors.metricName && formik?.touched.metricName
                    ? formik?.errors.metricName
                    : " "
                }
                error={
                  formik?.errors.metricName && formik?.touched.metricName
                    ? true
                    : false
                }
                // value={screenerState.customMetricName}
                value={formik.values.metricName}
                onChange={formik.handleChange}
                // onChange={(e) => {
                //   dispatch(setCustomMetricName(e.target.value));
                //   formik.setFieldValue("metricName", e.target.value);
                // }}
              />{" "}
              <TextField
                className="custom-metric-description"
                id="outlined-textarea"
                name="metricDescription"
                label="Metric Description"
                placeholder="Describe your custom metric ..."
                // value={screenerState.customMetricDescription}
                value={formik.values.metricDescription}
                onChange={formik.handleChange}
                // onChange={(e) => {
                //   dispatch(setCustomMetricDescription(e.target.value));
                //   formik.setFieldValue("metricDescription", e.target.value);
                // }}
                multiline
                helperText={
                  formik?.errors.metricDescription &&
                  formik?.touched.metricDescription
                    ? formik?.errors.metricDescription
                    : " "
                }
                error={
                  formik?.errors.metricDescription &&
                  formik?.touched.metricDescription
                    ? true
                    : false
                }
              />
            </div>
            {/* <FormulaEditor formik={formik} /> */}
            <FormulaEditorMonaco
              error={errorFormula}
              setError={setErrorFormula}
              formik={formik}
            />
            <Button
              //   onClick={(e) => {
              //     console.log("button clicked");
              //     e.stopPropagation();
              //   }}
              className="contained-custom-button"
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}>
              Save custom filter
            </Button>
            {/* <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              Save Custom Metric
            </Button> */}
          </form>
        )}
      </Formik>
    </Drawer>
  );
}

export default FormulaEditorDrawer;
