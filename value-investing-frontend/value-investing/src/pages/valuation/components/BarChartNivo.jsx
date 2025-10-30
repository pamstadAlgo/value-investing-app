import React from "react";
import { ResponsiveBar } from "@nivo/bar";

function BarChartNivo({ data, xAxisLabel, yAxisLabel }) {
  //   const data = [
  //     { quarter: 1, earnings: 13000 },
  //     { quarter: 2, earnings: 16500 },
  //     { quarter: 3, earnings: 14250 },
  //     { quarter: 4, earnings: 19000 },
  //   ];

  const rootStyles = getComputedStyle(document.documentElement);
  const barColor = rootStyles.getPropertyValue("--action-color").trim();

  // find max value
  const maxValue = Math.max(...data.map((d) => d.value));
  let scale = 1;
  let unit = "";

  if (maxValue > 1_000_000) {
    scale = 1_000_000;
    unit = "×10⁶"; //millions
  } else if (maxValue > 100_000) {
    scale = 1_000;
    unit = "×10³"; // thousands
  }

  // Scale down the data values for display

  const scaledData = data.map((d) => ({
    ...d,
    value: d.value / scale,
  }));

  //   const data = [
  //     {
  //       ranking: "A III",
  //       value: 140,
  //     },
  //     {
  //       ranking: "A II",
  //       value: 140,
  //     },
  //     {
  //       ranking: "A I",
  //       value: 140,
  //     },
  //     {
  //       ranking: "B III",
  //       value: 160,
  //     },
  //     {
  //       ranking: "B II",
  //       value: 160,
  //     },
  //     {
  //       ranking: "B I",
  //       value: 160,
  //     },
  //     {
  //       ranking: "C III",
  //       value: 200,
  //     },
  //     {
  //       ranking: "C II",
  //       value: 200,
  //     },
  //     {
  //       ranking: "C I",
  //       value: 200,
  //     },
  //     {
  //       ranking: "D III",
  //       value: 180,
  //     },
  //     {
  //       ranking: "D II",
  //       value: 180,
  //     },
  //     {
  //       ranking: "D I",
  //       value: 180,
  //     },
  //   ];

  return (
    <div
      style={{ height: "90%", padding: "16px" }}
      className="wrapper-nivo-bar-chart">
      {/* <h3 style={{ textAlign: "center", marginBottom: "16px" }}>
        My Chart Title
      </h3> */}
      <ResponsiveBar
        data={scaledData}
        keys={["value"]}
        indexBy="year"
        margin={{
          top: 20,
          right: 0,
          bottom: 40,
          left: 100,
        }}
        padding={0.6}
        groupMode="grouped"
        colors={barColor}
        // axisTop={null}
        axisRight={null}
        enableGridX
        enableGridY
        enableLabel={false}
        axisTop={{
          tickSize: 0,
          tickPadding: 0,
          format: () => "", // no ticks on top
          legend: unit ? unit : "", // top label
          legendPosition: "start",
          legendOffset: -10,
        }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
          legend: xAxisLabel,
          legendPosition: "middle",
          legendOffset: 32, // distance from axis
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
          legend: yAxisLabel, // <-- Y axis label
          legendPosition: "middle",
          legendOffset: -60, // negative to move left
        }}
      />
    </div>
  );
}

export default BarChartNivo;
