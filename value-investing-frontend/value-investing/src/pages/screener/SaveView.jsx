import React, { useEffect, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import SaveIcon from "@mui/icons-material/Save";
import { IconButton, Popover } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import * as Yup from "yup";
import { Formik } from "formik";
import useAxiosWithAuth from "../../axios/useAxiosWithAuth";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import {
  addSaveFilterView,
  setCurrentFilterView,
  setViewDescription,
  setViewName,
  updateSavedFilterViews,
} from "../../features/stockScreenerSlice";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useSnackbar } from "../GlobalComponents/SnackbarProvider";
import { Persist } from "formik-persist";

function SaveView() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showMessage } = useSnackbar();
  // Formik ref so we can call resetForm from here
  const formikRef = useRef(null);

  const axiosInstanceAuth = useAxiosWithAuth();
  const dispatch = useDispatch();

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const validationSchema = Yup.object({
    viewName: Yup.string().required("Metric Name is required"),
    viewDescription: Yup.string().required("Metric Description is required"),
  });

  return (
    <div>
      <Tooltip
        placement="right-start"
        arrow
        title="You need to add some filters before you can save the template"
        // disableHoverListener={screenerState.activFilters?.length !== 0}
        disableHoverListener={screenerState.selectedFilters?.length !== 0}
        disableFocusListener={screenerState.selectedFilters?.length !== 0}
        disableTouchListener={screenerState.selectedFilters?.length !== 0}>
        <div>
          <Button
            variant="contained"
            disabled={screenerState.selectedFilters?.length === 0}
            className="contained-custom-button"
            startIcon={<SaveOutlinedIcon className="button-icon" />}
            onClick={handleClick}>
            Save
          </Button>
        </div>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(e) => {
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
          Save the screener template
        </div>

        <Formik
          initialValues={{
            viewName: screenerState.viewName,
            viewDescription: screenerState.viewDescription,
          }}
          key={screenerState.viewName + screenerState.viewDescription}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            const payload = {
              view_name: values.viewName,
              view_description: values.viewDescription,
              view_filters: JSON.stringify(screenerState.selectedFilters),
            };

            dispatch(setViewName(values.viewName));
            dispatch(setViewDescription(values.viewDescription));

            //check if currentFilterView has id or not; if yes then filter already exists and should get updated; otherwise new filter will be created
            if (
              typeof screenerState.currentFilterView !== "string"
              //   !(screenerState.currentFilterView instanceof String)
            ) {
              //add id
              payload["id"] = screenerState.currentFilterView;
            }

            axiosInstanceAuth
              .put("/screener/filter-view/", payload)
              .then((response) => {
                //update currentFilterView
                dispatch(setCurrentFilterView(response.data.id));

                //update saveFilterViews; if id is already present we update; otherwise we push new item
                let filterView = screenerState.savedFilterViews.find(
                  (item) => item.id === response.data.id
                );

                if (!filterView) {
                  dispatch(addSaveFilterView(response.data));
                  showMessage("Template was successfully saved", "success");
                  // resetForm();
                } else {
                  dispatch(updateSavedFilterViews(response.data));
                  showMessage("Template was successfully updated", "success");
                }
              })
              .catch((error) => {
                showMessage(`Error saving the template: ${error}`, "error");
                console.error("ERROR: POST screener/filter-view");
              });
          }}>
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <div className="metric-description-flex-wrapper">
                <TextField
                  //   fullWidth
                  size="small"
                  label="Template name"
                  variant="outlined"
                  name="viewName"
                  value={formik.values.viewName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    // dispatch(setViewName(e.target.value));
                    formik.setFieldValue("viewName", e.target.value);
                  }}
                  helperText={
                    formik?.errors.viewName && formik?.touched.viewName
                      ? formik?.errors.viewName
                      : " "
                  }
                  error={
                    formik?.errors.viewName && formik?.touched.viewName
                      ? true
                      : false
                  }
                />{" "}
                <TextField
                  //   fullWidth
                  size="small"
                  className="custom-metric-description"
                  label="Template description"
                  variant="outlined"
                  name="viewDescription"
                  placeholder="Describe your Filter View ..."
                  multiline
                  value={formik.values.viewDescription}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    formik.setFieldValue("viewDescription", e.target.value);
                  }}
                  helperText={
                    formik?.errors.viewDescription &&
                    formik?.touched.viewDescription
                      ? formik?.errors.viewDescription
                      : " "
                  }
                  error={
                    formik?.errors.viewDescription &&
                    formik?.touched.viewDescription
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
                  Save Template
                </Button>
              </div>
              {/* <Persist name="save-screener-template-form" /> */}
            </form>
          )}
        </Formik>
      </Popover>
      {/* </Menu> */}
    </div>
  );
}

export default SaveView;
