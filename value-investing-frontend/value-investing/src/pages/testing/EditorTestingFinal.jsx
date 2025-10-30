import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as math from "mathjs";
import MathJax from "react-mathjax";
import { useSelector } from "react-redux";
// const ALLOWED_VARIABLES = ["Price", "EPV", "Revenue"];

function EditorTestingFinal() {
  const screenerState = useSelector((state) => state.stockscrenner);

  const [formula, setFormula] = useState("");
  const [error, setError] = useState(null);
  const [latex, setLatex] = useState("");
  const editorRef = useRef(null);
  const ALLOWED_VARIABLES_TEST = screenerState.filters.flatMap((item) =>
    item.tableColumns.filter((col) => col.fieldType !== "CharField")
  );

  console.log("ALLOWED_VARIABLES_TEST: ", ALLOWED_VARIABLES_TEST);

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
        "editorSuggestWidget.highlightForeground": "#1976d2", // <- highlight match color
      },
    });
    monaco.editor.setTheme("muiLight");

    // editor.addCommand(monaco.KeyCode.Enter, () => {
    //   console.log("Enter key pressed but blocked via command!");
    // });

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
    <div
      style={{
        width: 600,
        margin: "2rem auto",
        fontFamily: "Plus Jakarta Sans",
      }}>
      <h2>Formula Editor</h2>

      {/* Material-UI like wrapper */}
      <div
        style={{
          border: "1px solid rgba(0, 0, 0, 0.23)",
          borderRadius: 4,
          padding: 8,
          backgroundColor: "#fff",
          fontFamily: "monospace",
          position: "relative",
          //   minHeight: 56,
        }}>
        <fieldset class="custom-fieldset">
          <legend>Metric Definition</legend>
          {/* <label class="outlined-label monaco-editor-label">
          Metric Definition
        </label> */}
          <Editor
            //   height="40px"
            height="100px"
            defaultLanguage="plaintext"
            theme="vs-light"
            value={formula}
            onChange={(value) => setFormula(value || "")}
            beforeMount={handleBeforeMount}
            onMount={handleEditorDidMount}
            //   onKeyDown={(e) => {
            //     console.log("onkeydown");
            //     // Prevent Enter key
            //     if (e.keyCode === 13) {
            //       e.preventDefault();
            //       console.log("Enter key pressed but blocked!");
            //     }
            //   }}
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
        </fieldset>
        <div className="floating-hint">
          <span>
            <kbd>ctrl</kbd>+<kbd>i</kbd> (<kbd>⌘</kbd>+<kbd>i</kbd>) - Show all
            variables
          </span>
        </div>
      </div>

      {error ? (
        <p style={{ color: "red", marginTop: 8 }}>❌ {error}</p>
      ) : (
        <p style={{ color: "green", marginTop: 8 }}>✅ Valid formula</p>
      )}

      {!error && latex && (
        <div
          style={{
            marginTop: 16,
            padding: 8,
            background: "#f5f5f5",
            borderRadius: 8,
          }}>
          <MathJax.Provider>
            <MathJax.Node formula={latex} />
          </MathJax.Provider>
        </div>
      )}
    </div>
  );
}

export default EditorTestingFinal;
