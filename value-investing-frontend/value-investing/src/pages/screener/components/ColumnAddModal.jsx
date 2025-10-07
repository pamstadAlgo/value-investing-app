import React from "react";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import AddColumnFields from "./AddColumnFields";

function ColumnAddModal({ isOpen, handleClose }) {
  const screenerState = useSelector((state) => state.stockscrenner);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <div className="filter-modals-wrapper">
        {screenerState.filters.map((filter) => {
          if (filter.tableName !== "CustomMetrics") {
            return (
              <div className="filter-quantities-container">
                <h3>{filter.tableName}</h3>
                <div className="grid-wrapper-filters-modal">
                  {filter.tableColumns?.map((column) => {
                    return (
                      <AddColumnFields
                        field={column}
                        label={
                          column.readableName
                            ? column.readableName
                            : "dummy value"
                        }
                        checked={screenerState.additionalColumns.some(
                          (item) => item === column.techName
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
      </div>
    </Modal>
  );
}

export default ColumnAddModal;
