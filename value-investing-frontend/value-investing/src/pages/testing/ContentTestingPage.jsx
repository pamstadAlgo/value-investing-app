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

function ContentTestingPage() {
  return (
    <>
      <EditorTestingFinal />
      <fieldset class="custom-fieldset">
        <legend>Label</legend>
        <div>Content inside</div>
      </fieldset>

      <ExampleTable />
      <PlainTable />
      <ExampleTableSecond />
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
