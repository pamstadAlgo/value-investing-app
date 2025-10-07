import React, { useEffect, useRef, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import * as math from "mathjs";
import "katex/dist/katex.min.css";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import parse from "html-react-parser";
import { validateFormula } from "./helpers";

function EditableDiv() {
  //ref element for contentEditable Dif
  const contentRef = useRef(null);
  const [selectionRange, setSelectionRange] = useState(null);
  //state that tracks if div with metric checkboxes is hovered
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);

  // formula state used to display the formula
  const [formula, setFormula] = useState(false);
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
      console.log(
        "innerText of div editable checkbox click: ",
        contentRef.current.innerHTML
      );

      let customValidation = validateFormula(contentRef.current.innerHTML);

      if (!customValidation) {
        throw new Error("customValidation Failed");
      }

      console.log(
        "validateExpression: ",
        validateFormula(contentRef.current.innerHTML)
      );
      const parsed = math.parse(input); // Parse the formula
      console.log("input in toLatex: ", input);

      console.log("parsed in toLatex: ", parsed);
      console.log("parsed totex: ", parsed.toTex());
      return parsed.toTex(); // Convert to LaTeX
    } catch (error) {
      console.log("error toLatex: ", error);
      return "Invalid formula";
    }
  };

  // function that handles change of contentEditable div
  const handleSelectionChange = (e) => {
    //set value of formula that gets displayed
    setFormula(contentRef.current.textContent);

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
  const handleCheckboxClick = (e) => {
    //only add text if isCheckboxHovered is true; this means that we were focused before in the editable div field and then clicked the checkbox
    if (selectionRange && isCheckboxHovered) {
      const range = selectionRange.cloneRange(); // Clone the stored range

      //deletes content of current selection
      range.deleteContents(); // Optionally clear the current selection

      //create span element that will appear as a tag
      const spanNode = document.createElement("span");
      spanNode.className = "non-editable";
      spanNode.textContent = e.target.value;
      spanNode.setAttribute("contentEditable", "false");
      range.insertNode(spanNode); // Insert the new text
      // Move the cursor to the end of the inserted text
      range.setStartAfter(spanNode);
      range.setEndAfter(spanNode);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      //update formula state in order to display latex formula correctly
      setFormula(contentRef.current.textContent);
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

  //procedure that is executed when metric is saved
  const handleSaveMetric = (e) => {
    //@TO-DO: Save innerHTML to database such that formula can be displayed correctly again
    console.log(
      "innerText of div editable checkbox click: ",
      contentRef.current.innerHTML
    );

    console.log("typeof innerHtml: ", typeof contentRef.current.innerHTML);
    console.log("save metric formula: ", formula);
    console.log(
      "save metric latex formula: ",
      toLatex(formula).replace(/\s/g, "") //removes all white spaces from latex formula
    );
  };

  return (
    <div>
      <div
        className="formula-editor-div"
        ref={contentRef}
        contentEditable
        onKeyDown={handleKeyDown}
        onBeforeInput={handleOnBeforeInput}
        onInput={handleSelectionChange}
        onBlur={handleBlur}
        onMouseUp={handleSelectionChange}
        style={{
          border: "1px solid black",
          padding: "10px",
          minHeight: "50px",
        }}>
        {/* {parse(htmlString)} */}
      </div>

      {/* <InlineMath>{toLatex(formula)}</InlineMath> */}
      <div
        onMouseEnter={(e) => setIsCheckboxHovered(!isCheckboxHovered)}
        onMouseLeave={(e) => setIsCheckboxHovered(!isCheckboxHovered)}>
        <input value="Option1" type="checkbox" onChange={handleCheckboxClick} />{" "}
        Option 1
        <input
          value="Option2"
          type="checkbox"
          onChange={handleCheckboxClick}
        />{" "}
        Option 2
        <input
          value="Option3"
          type="checkbox"
          onChange={handleCheckboxClick}
        />{" "}
        Option 3
      </div>
      <BlockMath>{toLatex(formula)}</BlockMath>
      <IconButton aria-label="delete" onClick={handleSaveMetric}>
        <SaveIcon />
      </IconButton>
    </div>
  );
}

export default EditableDiv;
