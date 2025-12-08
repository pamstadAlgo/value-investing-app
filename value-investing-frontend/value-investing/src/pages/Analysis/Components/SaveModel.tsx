import React, { useState } from "react";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button } from "@mui/material";
import SaveModelPopover from "./SaveModelPopover";

function SaveModel() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <>
      <Button
        variant="contained"
        //   disabled={screenerState.selectedFilters?.length === 0}
        className="contained-custom-button"
        startIcon={<SaveOutlinedIcon className="button-icon" />}
        onClick={handleClick}>
        Save Model
      </Button>
      <SaveModelPopover
        open={open}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />
    </>
  );
}

export default SaveModel;
