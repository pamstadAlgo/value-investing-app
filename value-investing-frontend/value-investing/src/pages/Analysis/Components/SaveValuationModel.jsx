import React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { IconButton, ListItemText, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function SaveValuationModel() {
  const savedValuationModels = useSelector(
    (state) => state.analysis?.savedModels
  );
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  return (
    <FormControl className="form-control-saved-filter-views" size="small">
      <InputLabel id="demo-simple-select-label" className="custom-input-label">
        Saved Valuation Models
      </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        className="custom-select"
        // value={screenerState.currentFilterView}
        label="Saved Screener Templates"
        renderValue={(selected) => {
          //if selected is string then a new filter will be created
          if (typeof selected === "string") {
            return "Create new Filter View";
          }
          //   let selectedValue = screenerState.savedFilterViews.find(
          //     (item) => item.id === selected
          //   );
          //   console.log("selectedValue we return: ", selectedValue);
          //   return selectedValue?.view_name;
        }}
        //   onChange={handleChange}
      >
        {savedValuationModels?.length === 0 && (
          <MenuItem disabled>No Saved Valuation Models</MenuItem>
        )}
        {savedValuationModels?.map((item) => {
          return (
            <MenuItem key={item.id} value={item.id}>
              <ListItemText primary={item.view_name} />
              <Tooltip title="Delete Template" arrow>
                <IconButton
                  aria-label="delete"
                  //   onClick={(e) => handleDeleteFilterView(e, item.id)}
                >
                  <DeleteIcon className="button-icon-action" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          );
        })}
        {savedValuationModels?.length > 0 && (
          <MenuItem style={{ fontStyle: "italic" }} value="newModel">
            Create new valuation Model
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default SaveValuationModel;
