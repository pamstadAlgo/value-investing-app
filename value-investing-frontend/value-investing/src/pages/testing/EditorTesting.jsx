import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as math from "mathjs";
import MathJax from "react-mathjax";
const ALLOWED_VARIABLES = ["Price", "EPV", "Revenue"];

function EditorTesting() {
  const [formula, setFormula] = useState("(EPV - Price) / Price");
  const [error, setError] = useState(null);
  const [latex, setLatex] = useState("");
  const editorRef = useRef(null);

  // ✅ Validate and convert formula to LaTeX
  function validateAndConvert(formula) {
    try {
      const node = math.parse(formula);

      const variables = [];
      node.traverse((n) => {
        if (n.isSymbolNode) variables.push(n.name);
      });

      const invalidVars = variables.filter(
        (v) => !ALLOWED_VARIABLES.includes(v)
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
    const { error, latex } = validateAndConvert(formula);
    setError(error);
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
        suggestions: ALLOWED_VARIABLES.map((v) => ({
          label: v,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: v,
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
        <label class="outlined-label monaco-editor-label">Metric Definition</label>
        <Editor
          //   height="40px"
          height="100px"
          defaultLanguage="plaintext"
          theme="vs-light"
          value={formula}
          onChange={(value) => setFormula(value || "")}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          onKeyDown={(e) => {
            console.log("onkeydown");
            // Prevent Enter key
            if (e.keyCode === 13) {
              e.preventDefault();
              console.log("Enter key pressed but blocked!");
            }
          }}
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
            <kbd>ctrl</kbd>+<kbd>i</kbd> (<kbd>⌘</kbd>+<kbd>i</kbd>) - Show
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

  // WORKING EXAMPLE
  //   const [formula, setFormula] = useState("(EPV - Price) / Price");
  //   const [error, setError] = useState(null);
  //   const [latex, setLatex] = useState("");
  //   const editorRef = useRef(null);
  //   // ✅ Function to validate and convert formula to LaTeX
  //   function validateAndConvert(formula) {
  //     try {
  //       const node = math.parse(formula);
  //       // Extract all variable names from AST
  //       const variables = [];
  //       node.traverse((n) => {
  //         if (n.isSymbolNode) variables.push(n.name);
  //       });
  //       const invalidVars = variables.filter(
  //         (v) => !ALLOWED_VARIABLES.includes(v)
  //       );
  //       if (invalidVars.length > 0) {
  //         return {
  //           error: `Invalid variables: ${invalidVars.join(", ")}`,
  //           latex: "",
  //         };
  //       }
  //       // Convert to LaTeX
  //       const latex = node.toTex({ parenthesis: "keep" });
  //       return { error: null, latex };
  //     } catch (err) {
  //       return { error: err.message, latex: "" };
  //     }
  //   }
  //   // ✅ Validate formula whenever it changes
  //   useEffect(() => {
  //     const { error, latex } = validateAndConvert(formula);
  //     setError(error);
  //     setLatex(latex);
  //   }, [formula]);
  //   // ✅ Monaco editor mount: store editor instance + keybinding (optional)
  //   const handleEditorDidMount = (editor, monaco) => {
  //     editorRef.current = editor;
  //     // Register autocomplete provider
  //     monaco.languages.registerCompletionItemProvider("plaintext", {
  //       provideCompletionItems: () => ({
  //         suggestions: ALLOWED_VARIABLES.map((v) => ({
  //           label: v,
  //           kind: monaco.languages.CompletionItemKind.Variable,
  //           insertText: v,
  //         })),
  //       }),
  //     });
  //     editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
  //       editor.trigger("keyboard", "editor.action.triggerSuggest", {});
  //     });
  //   };
  //   // ✅ Button to trigger autocomplete reliably
  //   const triggerAutocomplete = () => {
  //     if (editorRef.current) {
  //       editorRef.current.trigger("keyboard", "editor.action.triggerSuggest", {});
  //     }
  //   };
  //   return (
  //     <div
  //       style={{ width: "600px", margin: "2rem auto", fontFamily: "sans-serif" }}>
  //       <h2>Formula Editor</h2>
  //       {/* Toolbar button */}
  //       <button
  //         onClick={triggerAutocomplete}
  //         style={{ marginBottom: "8px", padding: "6px 12px", cursor: "pointer" }}>
  //         Show Variables
  //       </button>
  //       <Editor
  //         height="180px"
  //         defaultLanguage="plaintext"
  //         theme="vs-dark"
  //         value={formula}
  //         onChange={(value) => setFormula(value || "")}
  //         beforeMount={(monaco) => {}}
  //         onMount={handleEditorDidMount}
  //         options={{
  //           minimap: { enabled: false },
  //           fontSize: 16,
  //           wordWrap: "on",
  //         }}
  //       />
  //       {error ? (
  //         <p style={{ color: "red", marginTop: "8px" }}>❌ {error}</p>
  //       ) : (
  //         <p style={{ color: "green", marginTop: "8px" }}>✅ Valid formula</p>
  //       )}
  //       {/* ✅ MathJax rendering */}
  //       {!error && latex && (
  //         <div
  //           style={{
  //             marginTop: "16px",
  //             padding: "8px",
  //             background: "#f5f5f5",
  //             borderRadius: "8px",
  //           }}>
  //           <MathJax.Provider>
  //             <MathJax.Node formula={latex} />
  //           </MathJax.Provider>
  //         </div>
  //       )}
  //     </div>
  //   );
}

export default EditorTesting;
