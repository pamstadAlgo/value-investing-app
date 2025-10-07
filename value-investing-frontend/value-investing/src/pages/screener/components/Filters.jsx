import React, { useState } from "react";
// import ChipInput from "./components/ChipInput";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import FiltersModal from "./FiltersModal";
import { useDispatch, useSelector } from "react-redux";
import ActivFilter from "./ActivFilter";
import * as Yup from "yup";
import { Formik } from "formik";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import CustomMetricsModal from "./CustomMetricsModal";
import { setQueryResult } from "../../../features/stockScreenerSlice";
import SaveView from "../SaveView";
// import SaveFilterViewModal from "./SaveFilterViewModal";

function Filters() {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCustomMetricsModalOpen, setIsCustomMetricsModalOpen] =
    useState(false);
  const [isFilterViewModalOpen, setIsFilterViewModalOpen] = useState(false);
  const dispatch = useDispatch();

  const screenerState = useSelector((state) => state.stockscrenner);

  const handleFiltersModalClose = () => {
    setIsFiltersModalOpen(false);
  };

  const handleCustomMetricsModalClose = () => {
    setIsCustomMetricsModalOpen(false);
  };

  const axiosInstanceAuth = useAxiosWithAuth();

  //create a validation schema
  const validationSchema = Yup.object().shape(
    screenerState.activFilters.reduce((acc, field, index) => {
      acc[`filter_${field.techName}_${field.id}`] = Yup.string().required(
        "filter is required!"
      );
      acc[`comparison_${field.techName}_${field.id}`] = Yup.string().required(
        "Comparison is required!"
      );
      acc[`qty_${field.techName}_${field.id}`] =
        Yup.string().required("Value is required!");

      return acc;
    }, {})
  );

  const initialValues = screenerState.activFilters.reduce(
    (acc, field, index) => {
      return {
        ...acc,
        [`filter_${field.techName}_${field.id}`]: field?.techName,
        [`comparison_${field.techName}_${field.id}`]: field?.comparison,
        [`qty_${field.techName}_${field.id}`]: field?.qty,
      };
    },
    {}
  );

  return (
    <div style={{ marginBottom: "16px" }}>
      <Accordion
        expanded={isFiltersExpanded}
        onChange={(e) => setIsFiltersExpanded(!isFiltersExpanded)}>
        <AccordionSummary
          className="accordian-summary-filters"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header">
          <Typography component="span">Filters</Typography>
          <SaveView />
        </AccordionSummary>
        <AccordionDetails>
          <div className="buttons-flex-wrapper">
            <div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={(e) => setIsFiltersModalOpen(true)}>
                Add Filter
              </Button>
              {/* <Tooltip
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
                    onClick={(e) => setIsFilterViewModalOpen(true)}>
                    <SaveIcon />
                  </IconButton>
                </span>
              </Tooltip> */}
            </div>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={(e) => setIsCustomMetricsModalOpen(true)}>
              Create Custom Metric
            </Button>
          </div>
          <div className="wrapper-activ-filters">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                //post filter quantities to endpoint
                axiosInstanceAuth
                  .post("/screener/filter-query/", screenerState.activFilters)
                  .then((response) => {
                    console.log("response of filter query: ", response.data);
                    dispatch(setQueryResult(response.data?.queryResult));
                  })
                  .catch((error) => {
                    console.error(
                      "ERROR: POST /screener/filter-query/: ",
                      error
                    );
                  });
              }}>
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  {screenerState.activFilters.map((filter) => {
                    // return <div>{filter.techName} </div>;
                    return (
                      <ActivFilter
                        formik={formik}
                        nameFilter={`filter_${filter.techName}_${filter.id}`}
                        nameComparison={`comparison_${filter.techName}_${filter.id}`}
                        nameQty={`qty_${filter.techName}_${filter.id}`}
                        filter={filter}
                        key={filter.techName}
                        fieldType={filter.fieldType}
                      />
                    );
                  })}
                  <Button
                    type="submit"
                    variant="contained"
                    // startIcon={<AddIconButton />}>
                  >
                    Filter
                  </Button>
                </form>
              )}
            </Formik>
            {/* {screenerState.activFilters.map((filter) => {
              return <ActivFilter filter={filter} key={filter.techName} />;
            })} */}
          </div>
        </AccordionDetails>
      </Accordion>

      <CustomMetricsModal
        isOpen={isCustomMetricsModalOpen}
        handleClose={handleCustomMetricsModalClose}
      />
      <FiltersModal
        isOpen={isFiltersModalOpen}
        handleClose={handleFiltersModalClose}
      />
    </div>
  );
}

export default Filters;
