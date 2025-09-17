from collections import deque
from quickfs_dj.models import BalanceSheetAnnual, IncomeStatementAnnual, CashFlowStatementAnnual, KeyRatiosAnnual

# def tokenize(expression):
#     """
#     This function splits an expression into its individual components:
#     (curr_asset - tot_liab)/shares --> [(, curr_asset, - , tot_liab, /, shares]
#     """
#     tokens = deque()  # Initialize an empty deque for tokens
#     token = ''  # Temporary variable to build multi-character tokens

#     for char in expression:
#         if char.isalnum() or char in '_':  # Check if the character is alphanumeric
#             token += char
#         else:
#             if token:  # If a token exists, append it to tokens
#                 tokens.append(token)
#                 token = ''  # Reset the token
#             if char in '+-*/()':  # Check if the character is an operator or parenthesis
#                 tokens.append(char)

#     # Append any remaining token at the end
#     if token:
#         tokens.append(token)
    
#     return tokens

def test_func(a,b):
    return a + b

def set_table(tokens):
    """
    based on the tokenized formula (return value from tokenize), this function determines which tables are invovled
    """
    table = set()
    while tokens:
        token = tokens.popleft()

        #check if the token is an operator; if yes we will not determine which table is involved
        if token not in "+-*/()":
            print('current token: ', token)
            #check in which table the token appears
            if token in BalanceSheetAnnual.column_metadata:
                table.add(BalanceSheetAnnual.column_metadata[token])
            elif token in IncomeStatementAnnual.column_metadata:
                table.add(IncomeStatementAnnual.column_metadata[token])
            elif token in CashFlowStatementAnnual.column_metadata:
                table.add(CashFlowStatementAnnual.column_metadata[token])
            elif token in KeyRatiosAnnual.column_metadata:
                table.add(KeyRatiosAnnual.column_metadata[token])
            else:
                print('token causing issues: ', token)
                raise ValueError("token {token} present in formula is not present in django models".format(token))
            
    
    return table

def tokenize(expression):
    """
    This function splits an expression into its individual components:
    (curr_asset - tot_liab)/shares --> [(, curr_asset, - , tot_liab, /, shares]
    """
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
        return all(char.isalnum() or char == '_' or char == '.' for char in string)
    
    while tokens:
        #popleft --> Remove and return the element from the left (front)
        token = tokens.popleft()
        print('current token: ', token)
        print('stack: ', stack)
        print('postfix: ', postfix)

        #The isalnum() method in Python is a string method that checks whether all the characters in a string are alphanumeric. Alphanumeric characters include letters (both uppercase and lowercase) and digits (0-9).
        # if token.isalnum() or token in '_':  # If it's an operand
        if is_alnum_or_underscore(token):
            print('token is alnum or underscore')
            postfix.append(token)
        elif token == '(':  # Open parenthesis, push it to stack
            print('token is (')

            stack.append(token)
        elif token == ')':  # Closing parenthesis, resolve the expression
            print('token is )')

            while stack and stack[-1] != '(':
                postfix.append(stack.pop())
            stack.pop()  # pop the '('
        elif token in operators:
            print('token is operator')

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
                stack.append(f"({left})/NULLIF(({right}),0)")
            else:
                stack.append(f"({left}){token}({right})")
        else:
            stack.append(token)
    
    return stack[0]  # The final result after evaluating the postfix expression

def add_sql_prefix(tokens, tables):
    #iterate through tokens and find associate table
    formatted_tokens = deque()

    while tokens:
        token = tokens.popleft()
        if token in '+-*/()':
            formatted_tokens.append(token)
        else:
            #find associated table
            if token in BalanceSheetAnnual.column_metadata:
                formatted_tokens.append(f"{BalanceSheetAnnual.column_metadata[token]}.{token}")
            elif token in IncomeStatementAnnual.column_metadata:
                formatted_tokens.append(f"{IncomeStatementAnnual.column_metadata[token]}.{token}")
            elif token in CashFlowStatementAnnual.column_metadata:
                formatted_tokens.append(f"{CashFlowStatementAnnual.column_metadata[token]}.{token}")
            elif token in KeyRatiosAnnual.column_metadata:
                formatted_tokens.append(f"{KeyRatiosAnnual.column_metadata[token]}.{token}")

    return formatted_tokens

# Main function to transform the expression
def transform_expression(expression, tables = []):
    #tokenize splits the string into a deque of characters. so a*b+c/d becomes deque(['a', '*', 'b', '+', 'c', '/', 'd'])
    tokens = tokenize(expression)

    print('tokens before trans: ', tokens)

    #if tables is not empty then we need to create prefix for quantities. so ev/ebit will become kr_q.ev/kr_y.ebit
    # if len(tables) > 0:
    #     tokens = add_sql_prefix(tokens, tables)

    print(f'this is tokens input: {tokens}')

    # print(f'expression input: {expression}, tokens we return {tokens}')
    postfix = parse_expression(tokens)

    print(f'this is postfix: {postfix} ')

    result = evaluate_postfix(postfix)
    return result