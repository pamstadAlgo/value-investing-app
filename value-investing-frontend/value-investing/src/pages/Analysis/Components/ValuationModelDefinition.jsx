import React, { useState } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Popper from "@mui/material/Popper";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

function ValuationModelDefinition() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const symbolicFormula = String.raw`
    V = B_0 + \frac{(\text{RNOA}_1 - r )\cdot \text{NOA}_0}{1 + r} 
      + \frac{(\text{RNOA}_2 - r ) \cdot \text{NOA}_1}{(1 + r)(r - g)} = B_0 + \frac{\text{NOPAT}_1 - r \cdot \text{NOA}_0}{1 + r} 
      + \frac{\text{NOPAT}_2 - r  \cdot \text{NOA}_1}{(1 + r)(r - g)}
  `;

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
      style={{ marginTop: "-2px" }}>
      {" "}
      <HelpOutlineIcon className="custom-icon-table" />{" "}
      <Popper
        className="custom-popover-charts formula"
        open={open}
        anchorEl={anchorEl}
        placement="right-start"
        onClose={handlePopoverClose}>
        <BlockMath math={symbolicFormula} />
      </Popper>
    </div>
  );
}

export default ValuationModelDefinition;
