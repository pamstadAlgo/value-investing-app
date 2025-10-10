import React from "react";
import Chip from "@mui/material/Chip";
import { useDispatch } from "react-redux";
import { remvSelectedFilter } from "../../../features/stockScreenerSlice";

function SelectedFilterChip({ filter, key }) {
  //create the label of the chip
  console.log("filter: ", filter);
  const dispatch = useDispatch();

  const handleDelete = () => {
    console.info("You clicked the delete icon.");
    dispatch(remvSelectedFilter(filter));
  };

  return (
    <Chip
      key={key}
      className="custom-chip"
      label={`${filter.readableName} ${filter.comparison} ${filter.qty}`}
      variant="outlined"
      onDelete={handleDelete}
    />
  );
}

export default SelectedFilterChip;
