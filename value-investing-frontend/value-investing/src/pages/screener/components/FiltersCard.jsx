import { Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useDispatch, useSelector } from "react-redux";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { NumericFormat } from "react-number-format";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  addSelectedFilter,
  setQueryResult,
} from "../../../features/stockScreenerSlice";
import SelectedFilterChip from "./SelectedFilterChip";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import Tooltip from "@mui/material/Tooltip";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function FiltersCard() {
  const screenerState = useSelector((state) => state.stockscrenner);
  const axiosInstanceAuth = useAxiosWithAuth();

  const [value, setValue] = useState(null);
  const [fieldType, setFieldType] = useState("");
  const dispatch = useDispatch();
  const materialUITextFieldProps = {
    id: "filled-multiline-flexible",
    label: "Value",
    maxRows: 4,
    variant: "outlined",
    // fullWidth: true,
    size: "small",
  };

  var transformedQty = [];

  const handleFilterStocks = () => {
    axiosInstanceAuth
      .post("/screener/filter-query/", screenerState.selectedFilters)
      .then((response) => {
        console.log("response of filter query: ", response.data);
        dispatch(setQueryResult(response.data?.queryResult));
      })
      .catch((error) => {
        console.error("ERROR: POST /screener/filter-query/: ", error);
      });
  };

  const [qty, setQty] = useState(transformedQty);

  const validationSchema = Yup.object({
    filter: Yup.object().nullable().required("Filter is required"),
    // filter: Yup.string().required("Comparison operator is required"),
    comparison: Yup.string().required("Comparison operator is required"),
    qty: Yup.string().required("Value is required"),
  });

  const handleFilterChange = (e, newValue, formik) => {
    console.log("newValue in handlefilterHCange: ", newValue);
    setValue(newValue);
    setFieldType(newValue?.fieldType);
    console.log("we set this formik filter value: ", newValue);
    //   formik.setFieldValue("filter", newValue?.techName);
    formik.setFieldValue("filter", newValue);
  };

  const handleComparisonChange = (e, formik) => {
    console.log("comparison change, value: ", e.target.value);
    formik.setFieldValue("comparison", e.target.value);
  };

  const handleValueChange = (e, newValue, formik) => {
    let oldValue = qty;
    setQty(newValue);

    formik.setFieldValue(
      "qty",
      `(${newValue.map((item) => `'${item}'`).join(", ")})`
    );

    console.log("newValue handleValueChange: ", newValue);
    console.log(
      "newValue transformed: ",
      `(${newValue.map((item) => `'${item}'`).join(", ")})`
    );
  };

  const handleNumberChange = (values, formik) => {
    const { formattedValue, value, floatValue } = values;
    formik.setFieldValue("qty", floatValue);
  };

  return (
    <div className="glass-card filters-criteria-grid-item">
      {" "}
      <div className="title-mid-size" style={{ marginBottom: "20px" }}>
        Filter Criteria
      </div>
      <div>
        {/* three fields: Filter autocomplete, comparison (select), value (depends on field type) */}
        <Formik
          initialValues={{
            filter: "",
            comparison: "",
            qty: "",
          }}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            //flatten the values object
            var filter = {
              ...values.filter,
              comparison: values.comparison,
              qty: values.qty,
            };

            dispatch(addSelectedFilter(filter));
            resetForm();
            setFieldType("");
            setValue(null);
            // here we need to more filter, qty, comparison and add to active filters
          }}>
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <div className="flexbox-wrapper-filter-criteria-fields">
                {/* add fields for validation */}
                <div className="flex-item-filter-field">
                  <Autocomplete
                    slotProps={{
                      popper: {
                        className: "autocomplete-filter-metric",
                      },
                    }}
                    // className="autocomplete-filter-metric"
                    clearOnEscape
                    value={value}
                    onChange={(e, newValue) =>
                      handleFilterChange(e, newValue, formik)
                    }
                    options={screenerState.autoCompleteFilters}
                    groupBy={(option) => option.table}
                    getOptionLabel={(option) => option.readableName}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        // fullWidth
                        size="small"
                        label="Filter"
                        // name={nameFilter}
                        name="filter"
                        helperText={
                          formik?.errors.filter && formik?.touched.filter
                            ? formik?.errors.filter
                            : " "
                        }
                        error={
                          formik?.errors.filter && formik?.touched.filter
                            ? true
                            : false
                        }
                      />
                    )}
                    renderGroup={(params) => {
                      return (
                        <li key={params.key}>
                          <div className="group-header-autocomplete">
                            {params.group}
                          </div>
                          <div>{params.children}</div>
                        </li>
                      );
                    }}
                  />
                </div>
                {/* comparison field */}
                <div className="flex-item-filter-field smaller-flex-item-select">
                  {fieldType !== "CharField" ? (
                    <FormControl
                      size="small"
                      fullWidth
                      error={
                        formik?.errors.comparison && formik?.touched.comparison
                          ? true
                          : false
                      }>
                      <InputLabel id="demo-simple-select-label">
                        Comparison
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={
                          formik?.values.comparison
                            ? formik?.values.comparison
                            : ""
                        }
                        name="comparison"
                        label="Comparison"
                        onChange={(e) => {
                          console.log("we call function");
                          handleComparisonChange(e, formik);
                        }}>
                        <MenuItem value="<=">
                          {"<= (smaller equal than)"}
                        </MenuItem>
                        <MenuItem value=">=">
                          {">= (greater equal than)"}
                        </MenuItem>
                        <MenuItem value="=">{"= (equal)"}</MenuItem>
                        <MenuItem value="!=">{"!= (not equal)"}</MenuItem>
                      </Select>
                      <FormHelperText>
                        {formik?.errors.comparison && formik?.touched.comparison
                          ? formik?.errors.comparison
                          : " "}
                      </FormHelperText>
                    </FormControl>
                  ) : (
                    <FormControl
                      size="small"
                      fullWidth
                      error={
                        formik?.errors.comparison && formik?.touched.comparison
                          ? true
                          : false
                      }>
                      <InputLabel id="demo-simple-select-label">
                        Comparison
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={
                          formik?.values.comparison
                            ? formik?.values.comparison
                            : ""
                        }
                        name="comparison"
                        label="Comparison"
                        onChange={(e) => {
                          console.log("we call function");
                          handleComparisonChange(e, formik);
                        }}>
                        <MenuItem value="in">{"in"}</MenuItem>
                        <MenuItem value="not in">{"not in"}</MenuItem>
                      </Select>
                      <FormHelperText>
                        {formik?.errors.comparison && formik?.touched.comparison
                          ? formik?.errors.comparison
                          : " "}
                      </FormHelperText>
                    </FormControl>
                  )}
                </div>
                <div className="flex-item-filter-field">
                  {/* value field */}
                  <Tooltip
                    placement="right-start"
                    className="tooltip-value-field"
                    title="Please select a filter first"
                    arrow
                    disableHoverListener={formik?.values.filter ? true : false}
                    disableFocusListener={formik?.values.filter ? true : false}
                    disableTouchListener={formik?.values.filter ? true : false}>
                    {fieldType !== "CharField" ? (
                      <div
                        // style={{ width: "100%" }}
                        className="flex-item-filter-field">
                        <NumericFormat
                          value={formik?.values.qty}
                          disabled={formik?.values.filter ? false : true}
                          onValueChange={(values) =>
                            handleNumberChange(values, formik)
                          }
                          thousandSeparator="'"
                          customInput={TextField}
                          {...{
                            ...materialUITextFieldProps,
                            name: "qty",
                            helperText:
                              formik?.errors.qty && formik?.touched.qty
                                ? formik?.errors.qty
                                : " ",
                            error:
                              formik?.errors.qty && formik?.touched.qty
                                ? true
                                : false,
                          }}
                        />
                      </div>
                    ) : (
                      <Autocomplete
                        multiple
                        id="checkboxes-tags-demo"
                        options={
                          screenerState.charFieldOptions?.field_options[
                            value?.techName
                          ]
                        }
                        disabled={formik?.values.filter ? false : true}
                        disableCloseOnSelect
                        value={qty}
                        getOptionLabel={(option) => option}
                        onChange={(e, newValue) =>
                          handleValueChange(e, newValue, formik)
                        }
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
                            size="small"
                            name="qty"
                            helperText={
                              formik?.errors.qty && formik?.touched.qty
                                ? formik?.errors.qty
                                : " "
                            }
                            error={
                              formik?.errors.qty && formik?.touched.qty
                                ? true
                                : false
                            }
                            label="Value"
                            // placeholder="Favorites"
                          />
                        )}
                      />
                    )}
                  </Tooltip>
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  className="contained-custom-button fit-content-button"
                  startIcon={
                    <AddCircleOutlineOutlinedIcon className="button-icon" />
                  }>
                  Add Filter
                </Button>
                {/* <Button
                type="submit"
                variant="contained"
                // startIcon={<AddIconButton />}>
              >
                Add Filter
              </Button> */}
              </div>
            </form>
          )}
        </Formik>
      </div>
      {/* <CustomMetrics /> */}
      <div
        className="title-mid-size"
        style={{ marginBottom: "20px", marginTop: "20px" }}>
        Applied Filters
      </div>
      <div className="applied-filters-flexbox-wrapper">
        {screenerState.selectedFilters.length > 0 ? (
          screenerState.selectedFilters.map((filter) => {
            return <SelectedFilterChip filter={filter} key={filter.id} />;
          })
        ) : (
          <div style={{ fontStyle: "italic" }} className="text-empty-filters">
            No selected filters{" "}
          </div>
        )}

        <Button
          style={{ marginLeft: "auto" }}
          onClick={handleFilterStocks}
          variant="contained"
          className="contained-custom-button fit-content-button"
          startIcon={<FilterAltOutlinedIcon className="button-icon" />}>
          Filter
        </Button>
      </div>
    </div>
  );
}

export default FiltersCard;
