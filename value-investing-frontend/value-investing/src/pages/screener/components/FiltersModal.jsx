import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import FilterField from "./FilterField";

function FiltersModal({ isOpen, handleClose }) {
  const screenerState = useSelector((state) => state.stockscrenner);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      {/* <div>We have some text inside Modal</div> */}
      <div className="filter-modals-wrapper">
        {screenerState.filters.map((filter) => {
          return (
            <div className="filter-quantities-container">
              <h3>{filter.tableName}</h3>
              <div className="grid-wrapper-filters-modal">
                {/* <FilterField
                  field={filter}
                  label={
                    filter.readableName ? filter.readableName : "dummy value"
                  }
                  checked={screenerState.activFilters.some(
                    (item) => item.techName === filter.techName
                  )}
                /> */}
                {filter.tableColumns?.map((column) => {
                  return (
                    <FilterField
                      field={column}
                      label={
                        column.readableName
                          ? column.readableName
                          : "dummy value"
                      }
                      checked={screenerState.activFilters.some(
                        (item) => item.techName === column.techName
                      )}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export default FiltersModal;
