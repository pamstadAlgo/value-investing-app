import React, { useEffect, useRef, useState } from "react";

import SaveIcon from "@mui/icons-material/Save";
import parse from "html-react-parser";
import IconButton from "@mui/material/IconButton";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import * as math from "mathjs";
import Button from "@mui/material/Button";
import FormulaAddButton from "./FormulaAddButton";
import { useDispatch, useSelector } from "react-redux";
import useAxiosWithAuth from "../../../axios/useAxiosWithAuth";
import FormHelperText from "@mui/material/FormHelperText";
import {
  setFormula,
  setFormulaInnerHtml,
  setRefetchFilterQuantities,
} from "../../../features/stockScreenerSlice";

function FormulaEditor({ formik }) {
  const screenerState = useSelector((state) => state.stockscrenner);

  //ref element for contentEditable Dif
  const contentRef = useRef(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const [initialHTMLContent, setInitialHTMLContent] = useState("");
  //state that tracks if div with metric checkboxes is hovered
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
  const dispatch = useDispatch();
  const axiosInstanceAuth = useAxiosWithAuth();

  // formula state used to display the formula
  //   const [formula, setFormula] = useState(false);
  const [formulaTechName, setFormulaTechName] = useState(false);

  useEffect(() => {
    setInitialHTMLContent(screenerState.formulaInnerHtml);
  }, []);

  //define allowed key strokes for the div editable field; all other quantities are added by clicking the checkboxes
  const allowedKeyStrokes = [
    "(",
    ")",
    "*",
    "/",
    "+",
    "-",
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
  ];

  const htmlString = `
    <span class="non-editable" contenteditable="false">Option1</span>-
    <span class="non-editable" contenteditable="false">Option2</span>/
    <span class="non-editable" contenteditable="false">Option3</span>
  `;

  // function that converts string formula like (a+b)/c to latex \frac{a+b}{c}
  const toLatex = (input) => {
    try {
      const parsed = math.parse(input); // Parse the formula
      return parsed.toTex(); // Convert to LaTeX
    } catch (error) {
      return "Invalid formula";
    }
  };

  // function that handles change of contentEditable div
  const handleSelectionChange = (e) => {
    //set value of formula that gets displayed
    dispatch(setFormula(contentRef.current.textContent));
    dispatch(setFormulaInnerHtml(contentRef.current.innerHTML));
    formik.setFieldValue("formulaEditor", contentRef.current.textContent);

    //   getSelection returns an object that provides information and methods about text or elements that are selected by the user
    const selection = window.getSelection();

    //check that focused element is not a non-editable one
    if (
      !selection?.focusNode?.parentElement?.className.includes("non-editable")
    ) {
      if (selection.rangeCount > 0) {
        //rangeCount returns the number of range objects that exist in the current selection. A range object is a portion of the HTML document
        // select the first range object of the selection
        const range = selection.getRangeAt(0);
        // check if the selected range object is contained within the editable div
        if (contentRef.current.contains(range.commonAncestorContainer)) {
          // make a shallow copy of the range object; this allows to work with the range independently without modifying the original range
          setSelectionRange(range.cloneRange());
        }
      }
    }
  };

  // Add text at the stored cursor position
  const handleQtyAdd = (label) => {
    //only add text if isCheckboxHovered is true; this means that we were focused before in the editable div field and then clicked the checkbox
    if (selectionRange && isCheckboxHovered) {
      const range = selectionRange.cloneRange(); // Clone the stored range

      //deletes content of current selection
      range.deleteContents(); // Optionally clear the current selection

      //create span element that will appear as a tag
      const spanNode = document.createElement("span");
      spanNode.className = "non-editable";
      // spanNode.textContent = e.target.value;
      spanNode.textContent = label;

      spanNode.setAttribute("contentEditable", "false");
      range.insertNode(spanNode); // Insert the new text
      // Move the cursor to the end of the inserted text
      range.setStartAfter(spanNode);
      range.setEndAfter(spanNode);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      //update formula state in order to display latex formula correctly
      dispatch(setFormula(contentRef.current.textContent));

      formik.setFieldValue("formulaEditor", contentRef.current.textContent);
      dispatch(setFormulaInnerHtml(contentRef.current.innerHTML));
    }
  };

  const handleBlur = (e) => {
    // if editable loses focus and it is not because of clicking a checkbox range will be reset; otherwise when clicking a checkbox later the text will be added at a random position
    if (!isCheckboxHovered) {
      setSelectionRange(null);
    }
  };

  //only allow certain key strokes in div input field; goal is to enter quantities by clicking
  const handleKeyDown = (e) => {
    if (!allowedKeyStrokes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  //this function is need to catch double space bar on Mac OS as these will be converted to ". "
  const handleOnBeforeInput = (e) => {
    // mac os replaces a fast double space press with ". " we need to prevent this from happening. Stack Overflow: https://stackoverflow.com/questions/44962941/html-text-input-element-disable-mac-double-space-to-insert-period
    if (e.nativeEvent.data === ". ") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <div className="formula-editor-wrapper">
      <div class="outlined-container">
        <label
          class="outlined-label"
          style={{
            color:
              formik?.errors.formulaEditor && formik?.touched.formulaEditor
                ? "#d32f2f"
                : "rgba(0, 0, 0, 0.6)",
          }}>
          Metric Definition
        </label>
        <div
          className="formula-editor-div"
          name="formulaEditor"
          ref={contentRef}
          contentEditable
          onKeyDown={handleKeyDown}
          onBeforeInput={handleOnBeforeInput}
          onInput={handleSelectionChange}
          onBlur={handleBlur}
          onMouseUp={handleSelectionChange}
          style={{
            // border: "1px solid black",
            padding: "10px",
            minHeight: "50px",
          }}>
          {parse(initialHTMLContent)}
        </div>
      </div>
      <FormHelperText
        error={
          formik?.errors.formulaEditor && formik?.touched.formulaEditor
            ? true
            : false
        }>
        {/* <div> */}
        {formik?.errors.formulaEditor && formik?.touched.formulaEditor
          ? formik?.errors.formulaEditor
          : " "}
        {/* </div> */}
      </FormHelperText>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <BlockMath>{toLatex(screenerState.formula)}</BlockMath>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          Save Custom Metric
        </Button>
      </div>
      <div
        className="filter-quantities-formula-wrapper"
        onMouseEnter={(e) => setIsCheckboxHovered(!isCheckboxHovered)}
        onMouseLeave={(e) => setIsCheckboxHovered(!isCheckboxHovered)}>
        {screenerState.filters.map((filter) => {
          return (
            <div className="filter-quantities-container">
              <h3>{filter.tableName}</h3>
              <div className="grid-wrapper-filters-modal">
                {filter.tableColumns?.map((column) => {
                  return (
                    <FormulaAddButton
                      handleButtonClick={handleQtyAdd}
                      label={column.techName ? column.techName : "dummy value"}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FormulaEditor;
