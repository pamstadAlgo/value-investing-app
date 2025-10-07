import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { Transform } from "@mui/icons-material";

function LineGraph({ data, legendYAxis, legendXAxis, yMin, yMax, sender }) {
  if (sender === "penman") {
    console.log("data line graph: ", data);
  }

  return (
    <ResponsiveLine
      data={data}
      //   className="testing"
      colors="hsl(224, 70%, 50%)"
      margin={{ top: 20, right: 40, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: yMin ? yMin : "auto",
        max: yMax ? yMax : "auto",
        stacked: true,
        reverse: false,
      }}
      // yFormat=" >-.2f"
      //   axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: legendXAxis,
        legendOffset: 36,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      //   axisTop={{
      //     orient: "top",
      //     // tickSize: 10,
      //     tickPadding: 5,
      //     tickRotation: 0,
      //     legend: "group if vertical, price if horizontal",
      //     legendPosition: "middle",
      //     legendOffset: -46,
      //     truncateTickAt: 0,
      //   }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        // legend: legendYAxis,
        legendOffset: -20,
        rotation: 0,
        rotate: 0,
        legendRotate: 0,
        legendRotation: 0,
        // transform: "translate(-100, 0) rotate(-180deg)",
        // legendRotation: 0,
        // rotate: -180,
        direction: "row",
        legendPosition: "top",
        truncateTickAt: 0,
      }}
      curve="cardinal"
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabel="data.yFormatted"
      pointLabelYOffset={-12}
      enableTouchCrosshair={true}
      useMesh={true}
      //   legends={[
      //     {
      //       anchor: "bottom-right",
      //       direction: "column",
      //       justify: false,
      //       translateX: 100,
      //       translateY: 0,
      //       itemsSpacing: 0,
      //       itemDirection: "right-to-left",
      //       itemWidth: 80,
      //       itemHeight: 20,
      //       itemOpacity: 0.75,
      //       symbolSize: 12,
      //       symbolShape: "circle",
      //       symbolBorderColor: "rgba(0, 0, 0, .5)",
      //       effects: [
      //         {
      //           on: "hover",
      //           style: {
      //             itemBackground: "rgba(0, 0, 0, .03)",
      //             itemOpacity: 1,
      //           },
      //         },
      //       ],
      //     },
      //   ]}
    />
  );
}

export default LineGraph;
