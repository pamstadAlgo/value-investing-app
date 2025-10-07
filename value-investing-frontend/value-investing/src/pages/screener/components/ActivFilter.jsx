import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { styled, lighten, darken } from "@mui/system";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { NumericFormat } from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import {
  remvActiveFilter,
  updateActiveFilter,
  updateComparisonOperator,
  updateQtyActiveFilter,
} from "../../../features/stockScreenerSlice";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ActivFilter({
  filter,
  formik,
  nameFilter,
  nameComparison,
  nameQty,
  fieldType,
}) {
  const screenerState = useSelector((state) => state.stockscrenner);

  //find object that corresponds to filter object
  let filterQuantitiy = screenerState.autoCompleteFilters.find(
    (item) => item?.techName === filter?.techName
  );

  // console.log("this is filter in ActivFilter: ", filter);
  var transformedQty = [];

  if (filter.fieldType === "CharField") {
    //char fields must be transformed to conform with AutoComplete Component
    if (filter.qty) {
      var transformedQty = filter?.qty
        .slice(1, -1) // Remove the outer parentheses
        .split(", ") // Split by comma and space
        .map((item) => item.slice(1, -1)); // Remove surrounding quotes
    }
  }

  const [value, setValue] = useState(filterQuantitiy);
  const [qty, setQty] = useState(transformedQty);

  const dispatch = useDispatch();

  const materialUITextFieldProps = {
    id: "filled-multiline-flexible",
    label: "Value",
    maxRows: 4,
    variant: "outlined",
    fullWidth: true,
  };

  const handleQuantityChange = (e, newValue) => {
    let oldValue = value;
    setValue(newValue);

    formik.setFieldValue(nameFilter, newValue);

    //update active filters
    dispatch(
      updateActiveFilter({
        newValue: { id: filter.id, ...newValue },
        oldValue: { id: filter.id, ...oldValue },
      })
    );
  };

  const handleValueChange = (e, newValue) => {
    let oldValue = qty;
    setQty(newValue);

    formik.setFieldValue(
      nameQty,
      `(${newValue.map((item) => `'${item}'`).join(", ")})`
    );

    console.log("newValue handleValueChange: ", newValue);
    console.log(
      "newValue transformed: ",
      `(${newValue.map((item) => `'${item}'`).join(", ")})`
    );

    // (${joinedString})
    // update active filters
    // dispatch(
    //   updateActiveFilter({
    //     newValue: { id: filter.id, qty: `(${newValue.join(", ")})` },
    //     oldValue: { id: filter.id, qty: `(${newValue.join(", ")})` },
    //   })
    // );

    dispatch(
      updateActiveFilter({
        newValue: {
          id: filter.id,
          qty: `(${newValue.map((item) => `'${item}'`).join(", ")})`,
        },
        oldValue: {
          id: filter.id,
          qty: `(${oldValue.map((item) => `'${item}'`).join(", ")})`,
        },
      })
    );
  };

  const handleComparisonChange = (e) => {
    //update the comparison operator
    dispatch(
      updateComparisonOperator({ comparison: e.target.value, filter: filter })
    );

    formik.setFieldValue(nameComparison, e.target.value);
  };

  const handleNumberChange = (values) => {
    const { formattedValue, value, floatValue } = values;
    // setQty(floatValue);

    //update activFilter state; note that filter is passed in order to find the correct filter in the array to update
    dispatch(updateQtyActiveFilter({ qty: floatValue, filter: filter }));
    formik.setFieldValue(nameQty, floatValue);
    // console.log("Formatted Value:", formattedValue); // E.g., 600'000'000
    // console.log("Raw String Value:", value); // E.g., 600000000
    // console.log("Float Value:", floatValue); // E.g., 600000000 as a n  };
  };

  const handleDeleteFilter = (e) => {
    dispatch(remvActiveFilter(filter));
  };

  return (
    <div className="activ-filter-flex-wrapper">
      <div className="flex-item-activ-filter">
        <Autocomplete
          clearOnEscape
          value={value}
          onChange={handleQuantityChange}
          options={screenerState.autoCompleteFilters}
          groupBy={(option) => option.table}
          getOptionLabel={(option) => option.readableName}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter"
              name={nameFilter}
              helperText={
                formik?.errors[nameFilter] && formik?.touched[nameFilter]
                  ? formik?.errors[nameFilter]
                  : " "
              }
              error={
                formik?.errors[nameFilter] && formik?.touched[nameFilter]
                  ? true
                  : false
              }
            />
          )}
          renderGroup={(params) => (
            <li key={params.key}>
              <div className="group-header-autocomplete">{params.group}</div>
              <div>{params.children}</div>
            </li>
          )}
        />
      </div>
      <div className="flex-item-activ-filter">
        {fieldType !== "CharField" ? (
          <FormControl
            fullWidth
            error={
              formik?.errors[nameComparison] && formik?.touched[nameComparison]
                ? true
                : false
            }>
            <InputLabel id="demo-simple-select-label">Comparison</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={
                formik?.values[nameComparison]
                  ? formik?.values[nameComparison]
                  : ""
              }
              name={nameComparison}
              label="Comparison"
              onChange={handleComparisonChange}>
              <MenuItem value="<=">{"<= (smaller equal than)"}</MenuItem>
              <MenuItem value=">=">{">= (greater equal than)"}</MenuItem>
              <MenuItem value="=">{"= (equal)"}</MenuItem>
              <MenuItem value="!=">{"!= (not equal)"}</MenuItem>
            </Select>
            <FormHelperText>
              {formik?.errors[nameComparison] && formik?.touched[nameComparison]
                ? formik?.errors[nameComparison]
                : " "}
            </FormHelperText>
          </FormControl>
        ) : (
          <FormControl
            fullWidth
            error={
              formik?.errors[nameComparison] && formik?.touched[nameComparison]
                ? true
                : false
            }>
            <InputLabel id="demo-simple-select-label">Comparison</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={
                formik?.values[nameComparison]
                  ? formik?.values[nameComparison]
                  : ""
              }
              name={nameComparison}
              label="Comparison"
              onChange={handleComparisonChange}>
              <MenuItem value="in">{"in"}</MenuItem>
              <MenuItem value="not in">{"not in"}</MenuItem>
              {/* <MenuItem value="=">{"= (equal)"}</MenuItem>
              <MenuItem value="!=">{"!= (not equal)"}</MenuItem> */}
            </Select>
            <FormHelperText>
              {formik?.errors[nameComparison] && formik?.touched[nameComparison]
                ? formik?.errors[nameComparison]
                : " "}
            </FormHelperText>
          </FormControl>
        )}
      </div>
      <div className="flex-item-activ-filter">
        {" "}
        {fieldType !== "CharField" ? (
          <NumericFormat
            value={formik?.values[nameQty]}
            onValueChange={handleNumberChange}
            thousandSeparator="'"
            customInput={TextField}
            {...{
              ...materialUITextFieldProps,
              name: nameQty,
              helperText:
                formik?.errors[nameQty] && formik?.touched[nameQty]
                  ? formik?.errors[nameQty]
                  : " ",
              error:
                formik?.errors[nameQty] && formik?.touched[nameQty]
                  ? true
                  : false,
            }}
          />
        ) : (
          <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={
              screenerState.charFieldOptions?.field_options[filter.techName]
            }
            disableCloseOnSelect
            value={qty}
            getOptionLabel={(option) => option}
            onChange={handleValueChange}
            // onInputChange={(event, newInputValue) => {
            //   console.log("onInputChange: ", newInputValue);
            // }}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              );
            }}
            // style={{ width: 500 }}
            renderInput={(params) => (
              <TextField
                {...params}
                name={nameQty}
                helperText={
                  formik?.errors[nameQty] && formik?.touched[nameQty]
                    ? formik?.errors[nameQty]
                    : " "
                }
                error={
                  formik?.errors[nameQty] && formik?.touched[nameQty]
                    ? true
                    : false
                }
                label="Value"
                // placeholder="Favorites"
              />
            )}
          />
        )}
      </div>
      <div className="flex-item-activ-filter delete-button">
        <Tooltip title="Delete Filter" arrow>
          <IconButton aria-label="delete" onClick={handleDeleteFilter}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default ActivFilter;
