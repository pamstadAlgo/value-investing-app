import React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import { IconButton, ListItemText, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTypedSelector } from "src/app/hooks";
import {
  changeTaxRate,
  changeTerminalGrowthRate,
  changeWacc,
  initializeValuationData,
  setSelectedModel,
} from "src/features/analysisSlice";
import { useSnackbar } from "src/pages/GlobalComponents/SnackbarProvider";

function SaveValuationModel() {
  const savedValuationModels = useTypedSelector(
    (state) => state.analysis?.savedModels
  );
  const selectedModel = useTypedSelector(
    (state) => state.analysis.selectedModel
  );
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();
  const { showMessage } = useSnackbar();

  function handleChange(e) {
    //if value is -1 it means new Model will be created
    if (e.target.value === -1) {
      console.log("we create a new model");
      dispatch(setSelectedModel({ isNew: true }));
    } else {
      // find selected model by index
      const modelIndex = savedValuationModels.findIndex(
        (item) => item.id === e.target.value
      );

      if (modelIndex !== -1) {
        try {
          dispatch(setSelectedModel(savedValuationModels[modelIndex]));

          //get data of selected model
          const data = JSON.parse(savedValuationModels[modelIndex].data);

          if (data?.valuationData) {
            dispatch(initializeValuationData(data?.valuationData));
          }

          if (data?.taxRate) {
            dispatch(changeTaxRate(data?.taxRate));
          }

          if (data?.wacc) {
            dispatch(changeWacc(data?.wacc));
          }

          if (data?.terminalGrowthRate) {
            dispatch(changeTerminalGrowthRate(data?.terminalGrowthRate));
          }

          showMessage("Model successfully loaded");
        } catch {
          showMessage("Error loading model", "error");
        }
      }

      console.log("we load existing value and select data");
    }
  }

  return (
    <FormControl
      className="form-control-saved-filter-views valuation-model"
      size="small">
      <InputLabel id="demo-simple-select-label" className="custom-input-label">
        Saved Valuation Models
      </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        className="custom-select"
        value={selectedModel?.isNew || !selectedModel ? -1 : selectedModel?.id}
        label="Saved Screener Templates"
        renderValue={(selected) => {
          console.log("this is selected: ", selected);

          if (selected === -1) {
            return "Create new valuation Model";
          } else {
            const modelIndex = savedValuationModels.findIndex(
              (item) => item.id === selected
            );

            if (modelIndex !== -1) {
              let valModel = savedValuationModels[modelIndex];
              return `${valModel.created_at} ${valModel.name}`;
            }
          }
        }}
        onChange={handleChange}>
        {savedValuationModels?.length === 0 && (
          <MenuItem disabled>No Saved Valuation Models</MenuItem>
        )}
        {savedValuationModels?.map((item) => {
          return (
            <MenuItem
              key={item.id}
              value={item.id}
              style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <ListItemText primary={`${item.created_at} ${item.name} `} /> */}
              <div>{`${item.created_at} ${item.name}`}</div>
              <Tooltip title="Delete Model" arrow>
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
          <MenuItem style={{ fontStyle: "italic" }} value={-1}>
            Create new valuation Model
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default SaveValuationModel;
