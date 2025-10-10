import React, { useRef, useState } from "react";
import "./styles.css";
import EditableDiv from "./EditableDiv";
import FiltersValidation from "./FiltersValidation";
import DataView from "./DataView";
import EditorTesting from "./EditorTesting";

function ContentTestingPage() {
  return (
    <>
      <EditorTesting />
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
