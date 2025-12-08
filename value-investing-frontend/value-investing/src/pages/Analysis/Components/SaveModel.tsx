import React, { useState } from "react";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button } from "@mui/material";
import SaveModelPopover from "./SaveModelPopover";
import { useTypedSelector } from "src/app/hooks";

function SaveModel() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const selectedModel = useTypedSelector(
    (state) => state.analysis.selectedModel
  );
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
        {`${selectedModel?.isNew === true ? "Save" : "Update"} Model`}
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
