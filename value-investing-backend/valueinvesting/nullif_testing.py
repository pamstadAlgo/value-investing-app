# import re

# def replace_denominator_with_nullif(latex_string):
#     # Define a regex pattern to match \frac expressions
#     pattern = r"\\frac\{([^{}]*)\}\{([^{}]*)\}"

#     # A function to process matches recursively
#     def replace_fraction(match):
#         numerator = match.group(1)
#         denominator = match.group(2)
        
#         # Check for nested fractions and process them first
#         numerator = re.sub(pattern, replace_fraction, numerator)
#         denominator = re.sub(pattern, replace_fraction, denominator)
        
#         # Replace the denominator with NULLIF(denominator, 0)
#         return f"\\frac{{{numerator}}}{{NULLIF({denominator}, 0)}}"

#     # Replace all fractions in the string
#     return re.sub(pattern, replace_fraction, latex_string)

# # Example usage
# latex_string = r"a*b+c+\frac{a}{b}+\frac{a + \frac{c}{d}}{e*\frac{h}{i}}"
# result = replace_denominator_with_nullif(latex_string)
# print(result)
from sympy.parsing.latex import parse_latex
from sympy import Function, symbols
# from latex2sympy2 import latex2sympy


def parse_latex_fraction(latex_string):
    """
    Parses a LaTeX string with fractions into a structured format and replaces denominators with NULLIF.
    """
    def parse_expression(expression):
        """
        Parses the LaTeX string into a tree structure and replaces denominators in fractions.
        """
        stack = []  # Stack to handle nested braces
        current = []  # Current level of the parsed tree
        i = 0

        while i < len(expression):
            char = expression[i]

            #detect \frac string
            if expression[i:i + 5] == r'\frac':
                # Parse a fraction expression
                i += 5  # Skip over '\frac'
                #we create a dictionary
                fraction = {'type': 'frac', 'numerator': [], 'denominator': []}
                current.append(fraction)
                stack.append(current)
                current = fraction['numerator']
            elif char == '{':
                # Start a new nested group
                stack.append(current)
                new_group = []
                if isinstance(current, list) and current and isinstance(current[-1], dict):
                    # Assign to numerator or denominator of the last fraction
                    if current[-1]['numerator'] is current:  # In numerator
                        current[-1]['numerator'] = new_group
                    else:  # In denominator
                        current[-1]['denominator'] = new_group
                else:
                    current.append(new_group)
                current = new_group
            elif char == '}':
                # End the current group and return to the previous level
                current = stack.pop()
            else:
                # Add characters to the current level
                current.append(char)
            i += 1

        return current

    def stringify_expression(parsed_expression):
        """
        Converts the parsed expression tree back into a LaTeX string, replacing denominators with NULLIF.
        """
        if isinstance(parsed_expression, list):
            return ''.join(stringify_expression(part) for part in parsed_expression)
        elif isinstance(parsed_expression, dict) and parsed_expression.get('type') == 'frac':
            numerator = stringify_expression(parsed_expression['numerator'])
            denominator = stringify_expression(parsed_expression['denominator'])
            # return f"\\frac{{{numerator}}}{{NULLIF({denominator}, 0)}}"
            return f"\\frac{{{numerator}}}{{\\NULLIF({denominator}, 0)}}"

        else:
            return parsed_expression

    # Parse the LaTeX string into a tree structure
    parsed_tree = parse_expression(latex_string)

    # print('this is parsed tree: ', parsed_tree)

    # Convert the tree back into a LaTeX string with transformations
    return stringify_expression(parsed_tree)

# Example usage
# latex_string = r"a*b+c+\frac{a}{b}+\frac{a + \frac{c}{d}}{e*\frac{h}{i}}"
# latex_string = r"\frac{\frac{a}{b} + \frac{c}{d}}{\frac{e}{f} + g}"
# latex_string = r"\frac{\frac{\frac{a}{b}}{c}}{d}"
latex_string = r"\frac{a}{b}*c+a-g*\frac{a + \frac{c}{d}}{e*\frac{h}{i}}"
# symbolic_math_string = "a/b*c+a-g*(a+c/d)/(e*h/i)"
#latex_string = r"Option1-\frac{\frac{Option2}{Option3}}{Option3}+\frac{Option3\cdotOption2}{\left(Option1\right)}"
result = parse_latex_fraction(latex_string)
# result = parse_latex_fraction(symbolic_math_string)

print('final result with NULLIF: ', result)


# # Define a custom function
# class NULLIF(Function):
#     pass

# # Preprocess the LaTeX
# latex_expr = r'\NULLIF{\frac{a}{b}}'
# preprocessed_expr = latex_expr.replace(r'NULLIF', 'NULLIF')

# # Parse and evaluate the LaTeX
# expr = parse_latex(preprocessed_expr)

# # Print the result
# print(expr)

# # expr = latex2sympy(result)
# expr = latex2sympy(latex_string)

# # Convert the expression to a string
# string_formula = str(expr)
# print(string_formula)





import sympy
from sympy.parsing.latex import parse_latex

# Step 1: Define the custom NULLIF function
NULLIF = sympy.Function('NULLIF')

# Step 2: Preprocess LaTeX string
latex_formula = r"\frac{a}{\NULLIF(b,0)}"
# preprocessed_latex = latex_formula.replace("NULLIF", "NULLIF_PLACEHOLDER")

# Step 3: Parse LaTeX into SymPy expression
expr = parse_latex(latex_formula)

# Step 4: Replace placeholder with actual NULLIF function
# expr = expr.subs('NULLIF_PLACEHOLDER', NULLIF)

# Step 5: Print the expression
# print(expr)
# print('parsed final result: ', parse_latex(result))