import React, { useState } from "react";
import FiltersModal from "../screener/components/FiltersModal";
import ActivFilter from "../screener/components/ActivFilter";
import { useSelector } from "react-redux";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

function FiltersValidation() {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const screenerState = useSelector((state) => state.stockscrenner);

  const handleFiltersModalClose = () => {
    setIsFiltersModalOpen(false);
  };

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

  console.log("these are initial values: ", initialValues);

  //validationSchema looks fine; what happens if we add and remove field? --> seems to work as well
  //next we add formik element

  return (
    <>
      <Accordion
        expanded={isFiltersExpanded}
        onChange={(e) => setIsFiltersExpanded(!isFiltersExpanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header">
          <Typography component="span">Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(e) => setIsFiltersModalOpen(true)}>
            Add Filter
          </Button>
          <div className="wrapper-activ-filters">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                console.log("Form Submitted", values);
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
          </div>
        </AccordionDetails>
      </Accordion>
      <FiltersModal
        isOpen={isFiltersModalOpen}
        handleClose={handleFiltersModalClose}
      />
    </>
  );
}

export default FiltersValidation;
