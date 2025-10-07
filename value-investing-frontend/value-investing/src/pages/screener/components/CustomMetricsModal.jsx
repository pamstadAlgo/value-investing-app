import React from "react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import EditableDiv from "../../testing/EditableDiv";
import FormulaEditor from "./FormulaEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  setCustomMetricDescription,
  setCustomMetricName,
  setFormula,
  setRefetchFilterQuantities,
} from "../../../features/stockScreenerSlice";
import { Formik } from "formik";
import * as Yup from "yup";
import * as math from "mathjs";
import { validateFormula } from "./helpers";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";

function CustomMetricsModal({ isOpen, handleClose }) {
  const screenerState = useSelector((state) => state.stockscrenner);
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  //reset formula value
  //   dispatch(setFormula(""));

  const validationSchema = Yup.object({
    metricName: Yup.string().required("Metric Name is required"),
    metricDescription: Yup.string().required("Metric Description is required"),
    formulaEditor: Yup.string()
      .test("custom-validation", "Formula is invalid", (value) => {
        // Your custom validation logic for field3
        try {

          let customValidation = validateFormula(
            screenerState.formulaInnerHtml
          );

          if (!customValidation) {
            throw new Error("customValidation Failed");
          }
          const parsed = math.parse(screenerState.formula); // Parse the formula

          var texFormat = parsed.toTex(); // Convert to LaTeX
          return true;
        } catch (error) {
          console.error("error toLatex: ", error);
          return false;
        }
      })
      .required("Formula is required"),
  });

  const initialValues = {
    metricName: screenerState.customMetricName,
    metricDescription: screenerState.customMetricDescription,
    formulaEditor: screenerState.formula,
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <div className="filter-modals-wrapper custom-metric">
        <div className="custom-metric-title">Create your Custom Metric</div>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const payload = {
              tech_name: screenerState.formula,
              readable_name: screenerState.customMetricName,
              description: screenerState.customMetricDescription,
              html_formula: screenerState.formulaInnerHtml,
            };

            axiosInstanceAuth
              .post("/screener/custom-metrics/", payload)
              .then((response) => {
                dispatch(
                  setRefetchFilterQuantities(
                    !screenerState.refetchFilterQuantities
                  )
                );
                //fetch again all metrics
              })
              .catch((error) => {
                console.error("ERROR: POST /screener/custom-metrics/: ", error);
              });
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
                  value={screenerState.customMetricName}
                  onChange={(e) => {
                    dispatch(setCustomMetricName(e.target.value));
                    formik.setFieldValue("metricName", e.target.value);
                  }}
                />{" "}
                <TextField
                  className="custom-metric-description"
                  id="outlined-textarea"
                  name="metricDescription"
                  label="Metric Description"
                  placeholder="Describe your custom metric ..."
                  value={screenerState.customMetricDescription}
                  onChange={(e) => {
                    dispatch(setCustomMetricDescription(e.target.value));
                    formik.setFieldValue("metricDescription", e.target.value);
                  }}
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
              <FormulaEditor formik={formik} />
            </form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}

export default CustomMetricsModal;
