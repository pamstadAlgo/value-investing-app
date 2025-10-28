import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ResponsiveBar } from "@nivo/bar";

// const data = [
//   {
//     name: "Page A",
//     uv: 4000,
//     pv: 2400,
//     amt: 2400,
//   },
//   {
//     name: "Page B",
//     uv: 3000,
//     pv: 1398,
//     amt: 2210,
//   },
//   {
//     name: "Page C",
//     uv: 2000,
//     pv: 9800,
//     amt: 2290,
//   },
//   {
//     name: "Page D",
//     uv: 2780,
//     pv: 3908,
//     amt: 2000,
//   },
//   {
//     name: "Page E",
//     uv: 1890,
//     pv: 4800,
//     amt: 2181,
//   },
//   {
//     name: "Page F",
//     uv: 2390,
//     pv: 3800,
//     amt: 2500,
//   },
//   {
//     name: "Page G",
//     uv: 3490,
//     pv: 4300,
//     amt: 2100,
//   },
// ];

function TestCompo() {
  const data = [
    {
      country: "AD",
      "hot dog": 50,
      burger: 140,
      sandwich: 70,
      kebab: 156,
      fries: 128,
      donut: 71,
    },
    {
      country: "AE",
      "hot dog": 5,
      burger: 195,
      sandwich: 125,
      kebab: 103,
      fries: 158,
      donut: 140,
    },
    {
      country: "AF",
      "hot dog": 50,
      burger: 192,
      sandwich: 153,
      kebab: 164,
      fries: 172,
      donut: 0,
    },
    {
      country: "AG",
      "hot dog": 48,
      burger: 161,
      sandwich: 6,
      kebab: 8,
      fries: 93,
      donut: 112,
    },
    {
      country: "AI",
      "hot dog": 163,
      burger: 34,
      sandwich: 50,
      kebab: 19,
      fries: 41,
      donut: 73,
    },
    {
      country: "AL",
      "hot dog": 126,
      burger: 181,
      sandwich: 176,
      kebab: 190,
      fries: 59,
      donut: 29,
    },
    {
      country: "AM",
      "hot dog": 71,
      burger: 90,
      sandwich: 38,
      kebab: 1,
      fries: 55,
      donut: 126,
    },
  ];

  return (
    <div className="my-bar-wrapper">
      <ResponsiveBar /* or Bar for fixed dimensions */
        data={data}
        indexBy="country"
        labelSkipWidth={12}
        labelSkipHeight={12}
        // legends={[
        //   {
        //     dataFrom: "keys",
        //     anchor: "bottom-right",
        //     direction: "column",
        //     translateX: 120,
        //     itemsSpacing: 3,
        //     itemWidth: 100,
        //     itemHeight: 16,
        //   },
        // ]}
        axisBottom={{ legend: "country (indexBy)", legendOffset: 32 }}
        axisLeft={{ legend: "food", legendOffset: -40 }}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      />
    </div>
  );
}

export default TestCompo;
