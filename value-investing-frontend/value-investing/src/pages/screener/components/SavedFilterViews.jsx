import React, { useEffect } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeActivFilters,
  initializeSelectedFilters,
  setCurrentFilterView,
  setSavedFilterViews,
  setViewDescription,
  setViewName,
} from "../../../features/stockScreenerSlice";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import { ListItemText } from "@mui/material";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
function SavedFilterViews() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  const handleChange = (e) => {
    dispatch(setCurrentFilterView(e.target.value));
    console.log("filter view we set: ", e.target.value);
    if (
      // typeof e.target.value === "string" ||
      // e.target.value instanceof String ||
      e.target.value === "newView"
    ) {
      console.log("we reinitialize selected filters");
      // dispatch(initializeActivFilters([]));
      dispatch(initializeSelectedFilters([]));
      dispatch(setViewName(""));
      dispatch(setViewDescription(""));
    } else {
      //load existing view
      var filterView = screenerState.savedFilterViews.find(
        (item) => item.id === e.target.value
      );

      //convert active filters to json
      let activFilters = JSON.parse(filterView.view_filters);

      dispatch(initializeSelectedFilters(activFilters));
      dispatch(setViewName(filterView.view_name));
      dispatch(setViewDescription(filterView.view_description));
    }
  };

  const handleDeleteFilterView = (e, id) => {
    console.log("we clicked button, e.target.value: ", id);
    e.stopPropagation();

    axiosInstanceAuth
      .delete("/screener/filter-view/", {
        data: { id: id },
      })
      .then((response) => {
        dispatch(setSavedFilterViews(response.data));
      })
      .catch((error) => {
        console.error("ERROR: DELETE /screener/filter-view/ ", error);
      });
  };

  //fetch selected filters associated with selected templates
  useEffect(() => {
    var currentFilterview = screenerState.currentFilterView;

    if (currentFilterview) {
      var filterView = screenerState.savedFilterViews.find(
        (item) => item.id === currentFilterview
      );

      //convert active filters to json
      if (filterView) {
        let activFilters = JSON.parse(filterView?.view_filters);

        dispatch(initializeSelectedFilters(activFilters));
        dispatch(setViewName(filterView.view_name));
        dispatch(setViewDescription(filterView.view_description));
      }
    }
  }, []);
  return (
    <FormControl className="form-control-saved-filter-views" size="small">
      <InputLabel id="demo-simple-select-label" className="custom-input-label">
        Saved Screener Templates
      </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        className="custom-select"
        value={screenerState.currentFilterView}
        label="Saved Screener Templates"
        renderValue={(selected) => {
          //if selected is string then a new filter will be created
          if (typeof selected === "string") {
            return "Create new Filter View";
          }
          let selectedValue = screenerState.savedFilterViews.find(
            (item) => item.id === selected
          );
          console.log("selectedValue we return: ", selectedValue);
          return selectedValue?.view_name;
        }}
        onChange={handleChange}>
        {screenerState?.savedFilterViews.length === 0 && (
          <MenuItem disabled>No Saved Filter Views</MenuItem>
        )}
        {screenerState?.savedFilterViews.map((item) => {
          //   return <MenuItem value={item.id}>{item.view_name}</MenuItem>;
          return (
            <MenuItem key={item.id} value={item.id}>
              {/* <Checkbox checked={personName.includes(name)} /> */}
              <ListItemText primary={item.view_name} />
              <Tooltip title="Delete Template" arrow>
                <IconButton
                  aria-label="delete"
                  onClick={(e) => handleDeleteFilterView(e, item.id)}>
                  <DeleteIcon className="button-icon-action" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          );
        })}
        {screenerState?.savedFilterViews.length > 0 && (
          <MenuItem style={{ fontStyle: "italic" }} value="newView">
            Create new Filter View
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default SavedFilterViews;
