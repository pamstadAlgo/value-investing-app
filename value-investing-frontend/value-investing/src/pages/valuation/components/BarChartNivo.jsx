import React from "react";
import { ResponsiveBar } from "@nivo/bar";

function BarChartNivo({ key }) {
  //   const data = [
  //     { quarter: 1, earnings: 13000 },
  //     { quarter: 2, earnings: 16500 },
  //     { quarter: 3, earnings: 14250 },
  //     { quarter: 4, earnings: 19000 },
  //   ];

  const data = [
    {
      ranking: "A III",
      value: 140,
    },
    {
      ranking: "A II",
      value: 140,
    },
    {
      ranking: "A I",
      value: 140,
    },
    {
      ranking: "B III",
      value: 160,
    },
    {
      ranking: "B II",
      value: 160,
    },
    {
      ranking: "B I",
      value: 160,
    },
    {
      ranking: "C III",
      value: 200,
    },
    {
      ranking: "C II",
      value: 200,
    },
    {
      ranking: "C I",
      value: 200,
    },
    {
      ranking: "D III",
      value: 180,
    },
    {
      ranking: "D II",
      value: 180,
    },
    {
      ranking: "D I",
      value: 180,
    },
  ];

  return (
    <div style={{ height: "90%", padding: "16px" }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="ranking"
        margin={{
          top: 20,
          right: 0,
          bottom: 40,
          left: 100,
        }}
        padding={0.6}
        groupMode="grouped"
        colors="#2a7ef0"
        axisTop={null}
        axisRight={null}
        enableGridX
        enableGridY
        enableLabel={false}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
        }}
      />
      {/* <ResponsiveBar
        key={key}
        data={data}
        keys={["earnings"]}
        indexBy="quarter"
        axisBottom={{ legend: "quarter (indexBy)", legendOffset: 32 }}
      /> */}
    </div>
  );
}

export default BarChartNivo;
