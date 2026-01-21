import React, { useState } from "react";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import BarChartNivo from "../../valuation/components/BarChartNivo";
import Popper from "@mui/material/Popper";

function MetricGraph({ data, metricName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
      {" "}
      <PollOutlinedIcon className="custom-icon-table" />{" "}
      <Popper
        className="custom-popover-charts"
        open={open}
        anchorEl={anchorEl}
        placement="right-start"
        onClose={handlePopoverClose}>
        {/* <Typography sx={{ p: 1 }}>I use Popover.</Typography> */}
        <BarChartNivo data={data} xAxisLabel="Year" yAxisLabel={metricName} />
      </Popper>
    </div>
  );
}

export default MetricGraph;
