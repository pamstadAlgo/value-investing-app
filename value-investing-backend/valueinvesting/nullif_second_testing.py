def parse_symbolic_math(expression):
    """
    Parses a symbolic math expression and replaces each denominator with NULLIF.
    Supports nested fractions and parentheses.
    """
    def parse_expression(expression):
        """
        Parses the symbolic math string into a tree structure.
        """
        stack = []  # Stack to handle nested parentheses
        current = []  # Current level of the parsed tree
        i = 0

        while i < len(expression):
            char = expression[i]

            if char == '(':
                # # Start a new nested group
                # stack.append(current)
                # new_group = []
                # current.append(new_group)
                # current = new_group
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
            elif char == ')':
                # End the current group and return to the previous level
                current = stack.pop()
            elif char == '/':
                # Handle a division operation
                # numerator = current.pop()  # Last item becomes the numerator
                # if not isinstance(numerator, list):
                #     numerator = [numerator]  # Ensure numerator is always a list
                fraction = {'type': 'frac', 'numerator': [], 'denominator': []}
                current.append(fraction)
                stack.append(current)
                # current = fraction['numerator']
                current = fraction['denominator']
            else:
                 # Add characters to the current level
                current.append(char)

            i += 1

        return current

    def stringify_expression(parsed_expression):
        """
        Converts the parsed expression tree back into a symbolic math string, replacing denominators with NULLIF.
        """
        if isinstance(parsed_expression, list):
            return ''.join(stringify_expression(part) for part in parsed_expression)
        elif isinstance(parsed_expression, dict) and parsed_expression.get('type') == 'frac':
            numerator = stringify_expression(parsed_expression['numerator'])
            denominator = stringify_expression(parsed_expression['denominator'])
            return f"({numerator}/NULLIF({denominator}, 0))"
        else:
            return parsed_expression

    # Parse the symbolic math string into a tree structure
    parsed_tree = parse_expression(expression)

    print('this is parsed tree: ', parsed_tree)

    # Convert the tree back into a symbolic math string with transformations
    return stringify_expression(parsed_tree)

# Example usage
symbolic_math_string = "a/b*c+a-g*(a+c/d)/(e*h/i)"
result = parse_symbolic_math(symbolic_math_string)
print(result)