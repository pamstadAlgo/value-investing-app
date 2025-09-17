from collections import deque

# Function to tokenize the input formula
# def tokenize(expression):
#     tokens = deque() #double-ended queue --> You can add or remove elements from both the front (left) and the back (right) of the deque.
#     token = ''
#     for char in expression:
#         if char in '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ':
#             token += char
#         else:
#             if token:
#                 tokens.append(token)
#                 token = ''
#             if char in '+-*/()':
#                 tokens.append(char)
#     if token:
#         tokens.append(token)
#     return tokens
def tokenize(expression):
    tokens = deque()  # Initialize an empty deque for tokens
    token = ''  # Temporary variable to build multi-character tokens

    for char in expression:
        if char.isalnum() or char in '_':  # Check if the character is alphanumeric
            token += char
        else:
            if token:  # If a token exists, append it to tokens
                tokens.append(token)
                token = ''  # Reset the token
            if char in '+-*/()':  # Check if the character is an operator or parenthesis
                tokens.append(char)

    # Append any remaining token at the end
    if token:
        tokens.append(token)
    
    return tokens

# Function to parse and construct the expression tree using a stack-based approach
def parse_expression(tokens):
    operators = set(['+', '-', '*', '/'])
    stack = []
    postfix = []
    
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2}
    
    def process_operator(op):
        while (stack and stack[-1] != '(' and precedence[stack[-1]] >= precedence[op]):
            postfix.append(stack.pop())
        stack.append(op)
    
    # def apply_nullif_to_denominator(expr):
    #     # Apply NULLIF for division expressions
    #     if '/' in expr:
    #         left, right = expr.split('/')
    #         return f"{left}/NULLIF({right},0)"
    #     return expr

    def is_alnum_or_underscore(string):
        return all(char.isalnum() or char == '_' for char in string)
    
    while tokens:
        #popleft --> Remove and return the element from the left (front)
        token = tokens.popleft()
        
        #The isalnum() method in Python is a string method that checks whether all the characters in a string are alphanumeric. Alphanumeric characters include letters (both uppercase and lowercase) and digits (0-9).
        # if token.isalnum() or token in '_':  # If it's an operand
        if is_alnum_or_underscore(token):
            postfix.append(token)
        elif token == '(':  # Open parenthesis, push it to stack
            stack.append(token)
        elif token == ')':  # Closing parenthesis, resolve the expression
            while stack and stack[-1] != '(':
                postfix.append(stack.pop())
            stack.pop()  # pop the '('
        elif token in operators:
            process_operator(token)
    
    while stack:
        postfix.append(stack.pop())
    
    return postfix

# Function to evaluate the postfix expression
def evaluate_postfix(postfix):
    stack = []
    
    for token in postfix:
        if token in '+-*/':
            right = stack.pop()
            left = stack.pop()
            if token == '/':
                stack.append(f"{left}/NULLIF({right},0)")
            else:
                stack.append(f"{left}{token}{right}")
        else:
            stack.append(token)
    
    return stack[0]  # The final result after evaluating the postfix expression

# Main function to transform the expression
def transform_expression(expression):
    #tokenize splits the string into a deque of characters. so a*b+c/d becomes deque(['a', '*', 'b', '+', 'c', '/', 'd'])
    tokens = tokenize(expression)

    print(f'this is tokens input: {tokens}')

    # print(f'expression input: {expression}, tokens we return {tokens}')
    postfix = parse_expression(tokens)

    print(f'this is postfix: {postfix} ')

    result = evaluate_postfix(postfix)
    return result

# Examples
expression1 = "var*curr_ass+c/d"
expression2 = "a/b*c+g-f/h"
expression3 = "a/(b+c*d)+h"
expression4 = "a/(b+c/d)-h"
expression5 = "a+b*(c/(a*b/c + a + c/(a+b)))"
expression6 = "a/b/c/(d*e+c/e/g)"

print(transform_expression(expression1))  # a*b+c/NULLIF(d,0)
# print(transform_expression(expression2))  # a/NULLIF(b,0)*c+g-f/NULLIF(h,0)
# print(transform_expression(expression3))  # a/NULLIF(b+c*d,0)+h
# print(transform_expression(expression4))  # a/(NULLIF(b+c/NULLIF(d,0), 0)-h
# print(transform_expression(expression5))  # a/(NULLIF(b+c/NULLIF(d,0), 0)-h
# print(transform_expression(expression6))  # a/(NULLIF(b+c/NULLIF(d,0), 0)-h