export function validateFormula(expression) {
      let lastWasSpan = false; // Track whether the last element was a span
      let lastWasOperator = false; // Track whether the last element was an operator

      // Iterate through the expression character by character
      let i = 0;
      while (i < expression.length) {
        if (expression[i] === "<" && expression[i + 1] === "s") {
          // Found the start of a <span> element
          const spanEndIndex = expression.indexOf("</span>", i);
          if (spanEndIndex === -1) {
            return false; // If no closing </span> is found, it's invalid
          }

          if (lastWasSpan) {
            // If the previous element was also a span, it's invalid
            return false;
          }

          // Mark that we've encountered a span
          lastWasSpan = true;
          lastWasOperator = false; // A span was just encountered, so no operator follows it yet

          // Move the index forward to the end of the <span> element
          i = spanEndIndex + 7;
        } else if ("+-*/".includes(expression[i])) {
          // Found an operator (+, -, *, /)
          if (lastWasOperator || lastWasSpan === false) {
            // If the last element was also an operator, or no span was before it, it's invalid
            return false;
          }

          // Mark that an operator was encountered
          lastWasOperator = true;
          lastWasSpan = false; // The operator is followed by a span, so reset the span flag
          i++;
        } else {
          i++;
        }
      }

      // Expression is valid if it ends with an operator, not with a span
      return true;
}