import React from "react";
import { IconButton, Popover } from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useTypedSelector } from "src/app/hooks";
import useAxiosWithAuth from "src/axios/useAxiosWithAuth";
import {
  setSelectedModel,
  updateSavedModels,
} from "src/features/analysisSlice";
import { useSnackbar } from "src/pages/GlobalComponents/SnackbarProvider";

type AnchorElSetter = (el: HTMLElement | null) => void;

type SaveModelPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  setAnchorEl: AnchorElSetter;
};

function SaveModelPopover({
  open,
  anchorEl,
  setAnchorEl,
}: SaveModelPopoverProps) {
  //get valuation state
  const valuation = useTypedSelector((state) => state.analysis);
  const axiosInstanceAuth = useAxiosWithAuth();
  const selectedModel = useTypedSelector(
    (state) => state.analysis.selectedModel
  );
  // validation schema for form
  const validationSchema = Yup.object({
    modelName: Yup.string().required("Model Name is required"),
    modelDescription: Yup.string().required("Model Description is required"),
  });
  const { showMessage } = useSnackbar();

  const initialValues = {
    modelName: selectedModel?.isNew === true ? "" : selectedModel.name,
    modelDescription:
      selectedModel?.isNew === true ? "" : selectedModel.description,
  };

  const dispatch = useDispatch();

  return (
    <Popover
      className="save-val-model-popover"
      open={open}
      anchorEl={anchorEl}
      onClose={(e: React.SyntheticEvent) => {
        e.stopPropagation();
        setAnchorEl(null);
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          padding: "16px",
          minWidth: "500px",
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
        },
      }}>
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Save your valuation model
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          console.log("we submit form, values: ", values);

          const data = {
            taxRate: valuation.taxRate,
            wacc: valuation.wacc,
            valuationData: valuation.valuationData,
            terminalGrowthRate: valuation.terminalGrowthRate,
          };

          // values need in payload
          let payload: {
            name: string;
            description: string;
            qfs_symbol: any;
            data: string;
            id?: number;
          } = {
            name: values.modelName,
            description: values.modelDescription,
            qfs_symbol: valuation.selectedTickerSymbol.qfs_symbol,
            // data: JSON.stringify(valuation.valuationData),
            data: JSON.stringify(data),
          };

          let modelId =
            selectedModel?.isNew === true ? undefined : selectedModel.id;

          //if model is not new we will also add id to payload
          if (modelId) {
            payload = { ...payload, id: modelId };
          }
          axiosInstanceAuth
            .put("/screener/valuation-model/", payload)
            .then((response) => {
              console.log("response valuation model", response.data);
              dispatch(updateSavedModels(response.data));
              dispatch(setSelectedModel(response.data));
              //close modal
              setAnchorEl(null);
              showMessage(
                `Model successfully ${
                  selectedModel?.isNew === true ? "saved" : "updated"
                }`
              );
            })
            .catch((error) => {
              showMessage(
                `Error ${
                  selectedModel?.isNew === true ? "saving" : "updating"
                } model`,
                "error"
              );
              console.error("error valuation-model: ", error);
            });
        }}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <div className="metric-description-flex-wrapper">
              <TextField
                //   fullWidth
                size="small"
                label="Model name"
                variant="outlined"
                name="modelName"
                value={formik.values.modelName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  formik.setFieldValue("modelName", e.target.value);
                }}
                helperText={
                  formik?.errors.modelName && formik?.touched.modelName
                    ? formik?.errors.modelName
                    : " "
                }
                error={
                  formik?.errors.modelName && formik?.touched.modelName
                    ? true
                    : false
                }
              />{" "}
              <TextField
                //   fullWidth
                size="small"
                className="custom-metric-description"
                label="Model description"
                variant="outlined"
                name="modelDescription"
                placeholder="Describe your Filter View ..."
                multiline
                value={formik.values.modelDescription}
                // onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  formik.setFieldValue("modelDescription", e.target.value);
                }}
                helperText={
                  formik?.errors.modelDescription &&
                  formik?.touched.modelDescription
                    ? formik?.errors.modelDescription
                    : " "
                }
                error={
                  formik?.errors.modelDescription &&
                  formik?.touched.modelDescription
                    ? true
                    : false
                }
              />
            </div>
            <div className="flexbox-save-filter-button">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="contained-custom-button"
                type="submit"
                variant="contained"
                startIcon={<SaveOutlinedIcon className="button-icon" />}>
                {selectedModel?.isNew === true ? "Save Model" : "Update Model"}
              </Button>
            </div>
            {/* <Persist name="save-screener-template-form" /> */}
          </form>
        )}
      </Formik>
    </Popover>
  );
}

export default SaveModelPopover;
