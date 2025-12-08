import React from "react";
import { IconButton, Popover } from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useSelector } from "react-redux";
import { useTypedSelector } from "src/app/hooks";
import useAxiosWithAuth from "src/axios/useAxiosWithAuth";

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

  // validation schema for form
  const validationSchema = Yup.object({
    modelName: Yup.string().required("Model Name is required"),
    modelDescription: Yup.string().required("Model Description is required"),
  });

  const initialValues = {
    modelName: "",
    modelDescription: "",
  };

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
        // initialValues={{
        //   viewName: screenerState.viewName,
        //   viewDescription: screenerState.viewDescription,
        // }}
        // key={screenerState.viewName + screenerState.viewDescription}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          console.log("we submit form, values: ", values);

          // values need in payload
          const payload = {
            name: values.modelName,
            description: values.modelDescription,
            qfs_symbol: valuation.selectedTickerSymbol.qfs_symbol,
            data: JSON.stringify(valuation.valuationData),
          };

          axiosInstanceAuth
            .put("/screener/valuation-model/", payload)
            .then((response) =>
              console.log("response valuation model", response.data)
            )
            .catch((error) => console.log("error valuation-model: ", error));
          //   const payload = {
          //     view_name: values.viewName,
          //     view_description: values.viewDescription,
          //     view_filters: JSON.stringify(screenerState.selectedFilters),
          //   };

          //   dispatch(setViewName(values.viewName));
          //   dispatch(setViewDescription(values.viewDescription));

          //   //check if currentFilterView has id or not; if yes then filter already exists and should get updated; otherwise new filter will be created
          //   if (
          //     typeof screenerState.currentFilterView !== "string"
          //     //   !(screenerState.currentFilterView instanceof String)
          //   ) {
          //     //add id
          //     payload["id"] = screenerState.currentFilterView;
          //   }

          //   axiosInstanceAuth
          //     .put("/screener/filter-view/", payload)
          //     .then((response) => {
          //       //update currentFilterView
          //       dispatch(setCurrentFilterView(response.data.id));

          //       //update saveFilterViews; if id is already present we update; otherwise we push new item
          //       let filterView = screenerState.savedFilterViews.find(
          //         (item) => item.id === response.data.id
          //       );

          //       if (!filterView) {
          //         dispatch(addSaveFilterView(response.data));
          //         showMessage("Template was successfully saved", "success");
          //         // resetForm();
          //       } else {
          //         dispatch(updateSavedFilterViews(response.data));
          //         showMessage("Template was successfully updated", "success");
          //       }
          //     })
          //     .catch((error) => {
          //       showMessage(`Error saving the template: ${error}`, "error");
          //       console.error("ERROR: POST screener/filter-view");
          //     });
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
                Save Model
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
