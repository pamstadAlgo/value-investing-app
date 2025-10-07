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
        title={
          screenerState.activFilters?.length === 0
            ? "You need to add some filters before you can save the view"
            : "Save Filter View"
        }
        arrow>
        <span>
          <IconButton
            disabled={screenerState.activFilters?.length === 0}
            aria-label="delete"
            onClick={handleClick}
            //   onClick={(e) => setIsFilterViewModalOpen(true)}
          >
            <SaveIcon />
          </IconButton>
        </span>
      </Tooltip>
      {/* <Menu
        id="basic-menu"
        className="paper-save-filter-view"
        anchorEl={anchorEl}
        open={open}
        onClose={(e) => {
          e.stopPropagation();
          setAnchorEl(null);
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        PaperProps={{
          style: {
            marginTop: "40px",
          },
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              padding: "16px",
              minWidth: "500px",
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}> */}
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
        <div className="custom-metric-title">Save the current Filters</div>

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
                  label="Filter View Name"
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
                  className="custom-metric-description"
                  label="Filter View Description"
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
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}>
                  Save Filter View
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
