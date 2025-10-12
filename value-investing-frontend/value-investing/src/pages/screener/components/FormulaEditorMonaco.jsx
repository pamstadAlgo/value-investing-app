import React, { useState, useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import * as math from "mathjs";
import MathJax from "react-mathjax";
import { useSelector } from "react-redux";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

function FormulaEditorMonaco({ formik, error, setError }) {
  const screenerState = useSelector((state) => state.stockscrenner);

  const [formula, setFormula] = useState("");
  //   const [error, setError] = useState(null);
  const [latex, setLatex] = useState("");
  const editorRef = useRef(null);
  //   const ALLOWED_VARIABLES_TEST = screenerState.filters.flatMap((item) =>
  //     item.tableColumns.filter((col) => col.fieldType !== "CharField")
  //   );
  const ALLOWED_VARIABLES_TEST = useMemo(() => {
    return screenerState.filters.flatMap((item) =>
      item.tableColumns.filter((col) => col.fieldType !== "CharField")
    );
  }, [screenerState.filters]);

  // ✅ Validate and convert formula to LaTeX
  function validateAndConvert(formula) {
    try {
      const node = math.parse(formula);

      console.log("node parsed formula: ", node);

      const variables = [];
      node.traverse((n) => {
        //   checks if symbol in formula is a variable (and not an operator)
        if (n.isSymbolNode) variables.push(n.name);
      });

      console.log("variables that we set: ", variables);

      const invalidVars = variables.filter(
        (v) => !ALLOWED_VARIABLES_TEST.some((obj) => obj.techName === v)
      );

      if (invalidVars.length > 0) {
        return {
          error: `Invalid variables: ${invalidVars.join(", ")}`,
          latex: "",
        };
      }

      return { error: null, latex: node.toTex({ parenthesis: "keep" }) };
    } catch (err) {
      return { error: err.message, latex: "" };
    }
  }

  useEffect(() => {
    console.log("formula from editor: ", formula);
    //   formula contains the raw string that appears in the editor field
    const { error, latex } = validateAndConvert(formula);
    setError(error);

    console.log("this is latex: ", latex);
    setLatex(latex);
  }, [formula]);

  // ✅ Trigger autocomplete with Ctrl+I / Cmd+I
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme("muiLight", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editorSuggestWidget.background": "#fff",
        "editor.background": "#00000000",
      },
    });
    monaco.editor.setTheme("muiLight");

    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Enter) {
        const suggestController = editor.getContribution(
          "editor.contrib.suggestController"
        );

        if (
          !suggestController.model ||
          !suggestController.model.state ||
          suggestController.model.state !== "open"
        ) {
          // Suggest widget not open → block Enter
          e.preventDefault();
          console.log("Enter blocked");
        }
        // Else → let Enter confirm the suggestion
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      editor.trigger("keyboard", "editor.action.triggerSuggest", {});
    });
  };

  // ✅ Only register autocomplete once in beforeMount
  const handleBeforeMount = (monaco) => {
    monaco.languages.registerCompletionItemProvider("plaintext", {
      provideCompletionItems: () => ({
        suggestions: ALLOWED_VARIABLES_TEST.map((v) => ({
          //   label: v,
          label: v.readableName ? v.readableName : v.techName,

          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: v.techName,
          //   insertText: "insert text",
        })),
      }),
    });
  };

  return (
    <div>
      <fieldset class="custom-fieldset">
        <legend className="legend-formula-editor">Metric Definition</legend>
        <Editor
          //   height="40px"
          height="100px"
          defaultLanguage="plaintext"
          theme="vs-light"
          value={formula}
          onChange={(value) => {
            setFormula(value || "");
            //set
          }}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            lineNumbers: "off",
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            lineDecorationsWidth: 0,
            wordWrap: "on", // wrap long lines
            scrollBeyondLastLine: false,
            // acceptSuggestionOnEnter: "off", // Enter won't insert new line
            fontSize: 16,
            renderLineHighlight: "none",
            padding: { top: 4, bottom: 4 },
          }}
        />
        <div className="floating-hint">
          <span>
            <kbd>ctrl</kbd>+<kbd>i</kbd> (<kbd>⌘</kbd>+<kbd>i</kbd>) - Show all
            variables
          </span>
        </div>
      </fieldset>
      {/* {error ? (
        <p style={{ color: "red", marginTop: 8 }}>❌ {error}</p>
      ) : (
        <p style={{ color: "green", marginTop: 8 }}>✅ Valid formula</p>
      )} */}
      <div className="editor-error-state"></div>

      {error ? (
        <div className="editor-error-state">
          <ErrorOutlineOutlinedIcon className="fail-icon" />
          <div>{error}</div>
        </div>
      ) : (
        /* </div>
        <p style={{ color: "red", marginTop: 8 }}>
          <ErrorOutlineOutlinedIcon /> {error}
        </p> */
        <div className="editor-error-state">
          <CheckCircleOutlineOutlinedIcon className="success-icon" />
          <div>Valid formula </div>
        </div>
      )}

      {!error && latex && (
        <div className="formula-editor-latex-repr">
          <MathJax.Provider>
            <MathJax.Node formula={latex} />
          </MathJax.Provider>
        </div>
      )}
    </div>
  );
}

export default FormulaEditorMonaco;
