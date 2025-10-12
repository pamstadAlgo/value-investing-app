import React, { useState } from "react";
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

function SaveView() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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

  const initialValues = {
    viewName: screenerState.viewName,
    viewDescription: screenerState.viewDescription,
    // viewFilters: "",
  };

  return (
    <div>
      <Tooltip
        title="You need to add some filters before you can save the template"
        disableHoverListener={screenerState.activFilters?.length !== 0}>
        <Button
          variant="contained"
          disabled={screenerState.activFilters?.length === 0}
          className="contained-custom-button"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleClick}>
          Save
        </Button>
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
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const payload = {
              view_name: values.viewName,
              view_description: values.viewDescription,
              view_filters: JSON.stringify(screenerState.activFilters),
            };

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
                } else {
                  dispatch(updateSavedFilterViews(response.data));
                }
              })
              .catch((error) => {
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
                    dispatch(setViewName(e.target.value));
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
                    dispatch(setViewDescription(e.target.value));
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
                {/* <button
                  type="submit"
                  onClick={(e) => {
                    console.log("button clicked");
                    e.stopPropagation(); // still stops the click event bubbling
                  }}>
                  {" "}
                  Save Filter View
                </button> */}
                <Button
                  onClick={(e) => {
                    console.log("button clicked");
                    e.stopPropagation();
                  }}
                  className="contained-custom-button"
                  type="submit"
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}>
                  Save Template
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Popover>
      {/* </Menu> */}
    </div>
  );
}

export default SaveView;
