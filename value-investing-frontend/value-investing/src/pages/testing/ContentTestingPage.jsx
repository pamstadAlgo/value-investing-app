import React, { useRef, useState } from "react";
import "./styles.css";
import EditableDiv from "./EditableDiv";
import FiltersValidation from "./FiltersValidation";
import DataView from "./DataView";
import EditorTesting from "./EditorTesting";
import EditorTestingFinal from "./EditorTestingFinal";
import ExampleTable from "./ExampleTable";
import PlainTable from "./PlainTable";
import ExampleTableSecond from "./ExampleTableSecond";
import AreaChartCompo from "../valuation/components/AreaChartCompo";
import TestCompo from "../valuation/components/TestCompo";
import { ResponsiveLine } from "@nivo/line";
import BarChartNivo from "../valuation/components/BarChartNivo";

function ContentTestingPage() {
  const data = [
    {
      id: "japan",
      data: [
        {
          x: "plane",
          y: 73,
        },
        {
          x: "helicopter",
          y: 227,
        },
        {
          x: "boat",
          y: 161,
        },
        {
          x: "train",
          y: 178,
        },
        {
          x: "subway",
          y: 87,
        },
        {
          x: "bus",
          y: 9,
        },
        {
          x: "car",
          y: 97,
        },
        {
          x: "moto",
          y: 11,
        },
        {
          x: "bicycle",
          y: 28,
        },
        {
          x: "horse",
          y: 221,
        },
        {
          x: "skateboard",
          y: 272,
        },
        {
          x: "others",
          y: 94,
        },
      ],
    },
    {
      id: "france",
      data: [
        {
          x: "plane",
          y: 131,
        },
        {
          x: "helicopter",
          y: 102,
        },
        {
          x: "boat",
          y: 19,
        },
        {
          x: "train",
          y: 169,
        },
        {
          x: "subway",
          y: 140,
        },
        {
          x: "bus",
          y: 58,
        },
        {
          x: "car",
          y: 156,
        },
        {
          x: "moto",
          y: 132,
        },
        {
          x: "bicycle",
          y: 206,
        },
        {
          x: "horse",
          y: 231,
        },
        {
          x: "skateboard",
          y: 288,
        },
        {
          x: "others",
          y: 146,
        },
      ],
    },
    {
      id: "us",
      data: [
        {
          x: "plane",
          y: 267,
        },
        {
          x: "helicopter",
          y: 224,
        },
        {
          x: "boat",
          y: 159,
        },
        {
          x: "train",
          y: 9,
        },
        {
          x: "subway",
          y: 127,
        },
        {
          x: "bus",
          y: 196,
        },
        {
          x: "car",
          y: 15,
        },
        {
          x: "moto",
          y: 187,
        },
        {
          x: "bicycle",
          y: 243,
        },
        {
          x: "horse",
          y: 38,
        },
        {
          x: "skateboard",
          y: 72,
        },
        {
          x: "others",
          y: 229,
        },
      ],
    },
    {
      id: "germany",
      data: [
        {
          x: "plane",
          y: 232,
        },
        {
          x: "helicopter",
          y: 219,
        },
        {
          x: "boat",
          y: 29,
        },
        {
          x: "train",
          y: 220,
        },
        {
          x: "subway",
          y: 211,
        },
        {
          x: "bus",
          y: 14,
        },
        {
          x: "car",
          y: 39,
        },
        {
          x: "moto",
          y: 131,
        },
        {
          x: "bicycle",
          y: 294,
        },
        {
          x: "horse",
          y: 18,
        },
        {
          x: "skateboard",
          y: 88,
        },
        {
          x: "others",
          y: 143,
        },
      ],
    },
    {
      id: "norway",
      data: [
        {
          x: "plane",
          y: 289,
        },
        {
          x: "helicopter",
          y: 133,
        },
        {
          x: "boat",
          y: 221,
        },
        {
          x: "train",
          y: 126,
        },
        {
          x: "subway",
          y: 299,
        },
        {
          x: "bus",
          y: 271,
        },
        {
          x: "car",
          y: 271,
        },
        {
          x: "moto",
          y: 32,
        },
        {
          x: "bicycle",
          y: 10,
        },
        {
          x: "horse",
          y: 150,
        },
        {
          x: "skateboard",
          y: 268,
        },
        {
          x: "others",
          y: 33,
        },
      ],
    },
  ];

  return (
    <>
      {/* <EditorTestingFinal />
      <fieldset class="custom-fieldset">
        <legend>Label</legend>
        <div>Content inside</div>
      </fieldset>

      <ExampleTable />
      <PlainTable />
      <ExampleTableSecond /> */}
      <BarChartNivo />
      <TestCompo />
      <div className="my-wrapper-div" style={{ height: "500px" }}>
        <ResponsiveLine /* or Line for fixed dimensions */
          data={data}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          axisBottom={{ legend: "transportation", legendOffset: 36 }}
          axisLeft={{ legend: "count", legendOffset: -40 }}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "seriesColor" }}
          pointLabelYOffset={-12}
          enableTouchCrosshair={true}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              translateX: 100,
              itemWidth: 80,
              itemHeight: 22,
              symbolShape: "circle",
            },
          ]}
        />
      </div>
      {/* <EditableDiv />
      <FiltersValidation />
      <DataView />
      <div class="outlined-container">
        <label class="outlined-label">Your Label</label>
        <div class="outlined-content">fasdf</div>
      </div> */}
    </>
  );
}

export default ContentTestingPage;
