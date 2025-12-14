from collections import deque
from quickfs_dj.models import BalanceSheetAnnual, IncomeStatementAnnual, CashFlowStatementAnnual, KeyRatiosAnnual
from django.db.models.functions import ExtractYear

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


# classif balance sheet entries into:
# 1. current assets
# 2. non-current assets
# 3. current liabilities
# 4. non-current liabilities
# 5. equity


    # qfs_symbol = models.ForeignKey(TradedCompanies, to_field='qfs_symbol', on_delete=models.CASCADE, db_index=True)
    # period_end_date = models.DateField(db_index=True)
    # DONE cash_and_equiv = models.FloatField(null=True, blank=True, db_index=True)
    # DONE st_investments = models.FloatField(null=True, blank=True)
    # DONE receivables = models.FloatField(null=True, blank=True)
    # DONE inventories = models.FloatField(null=True, blank=True)
    # DONE other_current_assets = models.FloatField(null=True, blank=True)
    # DONE total_current_assets = models.FloatField(null=True, blank=True)
    # DONE equity_and_other_investments = models.FloatField(null=True, blank=True)
    # NOT TAKEN ppe_gross = models.FloatField(null=True, blank=True)
    # NOT TAKEN accumulated_depreciation = models.FloatField(null=True, blank=True)
    # DONE ppe_net = models.FloatField(null=True, blank=True)
    # DONE intangible_assets = models.FloatField(null=True, blank=True)
    # DONE goodwill = models.FloatField(null=True, blank=True)
    # DONE other_lt_assets = models.FloatField(null=True, blank=True)
    # DONE total_assets = models.FloatField(null=True, blank=True)
    # DONE accounts_payable = models.FloatField(null=True, blank=True)
    # DONE tax_payable = models.FloatField(null=True, blank=True)
    # DONE current_accrued_liabilities = models.FloatField(null=True, blank=True)
    # DONE st_debt = models.FloatField(null=True, blank=True)
    # DONE current_deferred_revenue = models.FloatField(null=True, blank=True)
    # DONE current_deferred_tax_liability = models.FloatField(null=True, blank=True)
    # DONE current_capital_leases = models.FloatField(null=True, blank=True)
    # DONE other_current_liabilities = models.FloatField(null=True, blank=True)
    # DONE total_current_liabilities = models.FloatField(null=True, blank=True)
    # DONE lt_debt = models.FloatField(null=True, blank=True)
    # DONE noncurrent_capital_leases = models.FloatField(null=True, blank=True)
    # DONE pension_liabilities = models.FloatField(null=True, blank=True)
    # DONE noncurrent_deferred_revenue = models.FloatField(null=True, blank=True)
    # DONE other_lt_liabilities = models.FloatField(null=True, blank=True)
    # DONE total_liabilities = models.FloatField(null=True, blank=True)
    # DONE common_stock = models.FloatField(null=True, blank=True)
    # DONE preferred_stock = models.FloatField(null=True, blank=True)
    # DONE retained_earnings = models.FloatField(null=True, blank=True)
    # DONE aoci = models.FloatField(null=True, blank=True)
    # DONE apic = models.FloatField(null=True, blank=True)
    # DONE treasury_stock = models.FloatField(null=True, blank=True)
    # other_equity = models.FloatField(null=True, blank=True)
    # minority_interest_liability = models.FloatField(null=True, blank=True)
    # total_equity = models.FloatField(null=True, blank=True)
    # total_liabilities_and_equity = models.FloatField(null=True, blank=True)
    # DONE total_investments = models.FloatField(null=True, blank=True)
    # DONE deferred_policy_acquisition_cost = models.FloatField(null=True, blank=True)
    # DONE unearned_premiums = models.FloatField(null=True, blank=True)
    # DONE future_policy_benefits = models.FloatField(null=True, blank=True)
    # DONE loans_gross = models.FloatField(null=True, blank=True)
    # DONE allowance_for_loan_losses = models.FloatField(null=True, blank=True)
    # DONE unearned_income = models.FloatField(null=True, blank=True)
    # DONE loans_net = models.FloatField(null=True, blank=True)
    # DONE deposits_liability = models.FloatField(null=True, blank=True)
    # operating_assets = models.FloatField(null=True, blank=True, verbose_name="Operating Assets") #this field is computed with management command
    # operating_liabilities = models.FloatField(null=True, blank=True, verbose_name="Operating Liabilities") #this field is computed with management command
    # net_operating_assets = models.FloatField(null=True, blank=True, verbose_name="Net Operating Assets") #this field is computed with management command







BALANCE_SHEET_GROUPS = {
    "currentAssets": [
        {"metric" : "cash_and_equiv", "label" : "Cash and Equivalents"},
        {"metric" : "st_investments", "label" : "Short-Term Investments"},
        {"metric" : "total_investments", "label" : "Securities & Investments"},
        {"metric" : "receivables", "label" : "Accounts Receivable"},
        {"metric" : "inventories", "label" : "Inventories"},
        {"metric" : "other_current_assets", "label" : "Other Current Assets"},
        # {"metric" : "total_current_assets", "label" : "Total Current Assets"},
    ],
    "nonCurrentAssets": [
        {"metric" : "loans_gross", "label" : "Gross Loans"},
        {"metric" : "allowance_for_loan_losses", "label" : "Loan Loss Reserve"},
        {"metric" : "loans_net", "label" : "Net Loans"},
        {"metric" : "ppe_net", "label" : "Property, Plant & Equipment (net)"},
        {"metric" : "deferred_policy_acquisition_cost", "label" : "Deferred Policy Acquisition Cost"},
        {"metric" : "equity_and_other_investments", "label" : "Equity & Investments"},
        {"metric" : "intangible_assets", "label" : "Intangible Assets"},
        {"metric" : "goodwill", "label" : "Goodwill"},
        {"metric" : "other_lt_assets", "label" : "Other Assets"},
        # {"metric" : "total_assets", "label" : "Total Assets"},
    ],
    "currentLiab": [
        {"metric" : "accounts_payable", "label" : "Accounts Payable"},
        {"metric" : "tax_payable", "label" : "Tax Payable"},
        {"metric" : "current_accrued_liabilities", "label" : "Accrued Liabilities"},
        {"metric" : "unearned_premiums", "label" : "Unearned Premiums"},
        {"metric" : "future_policy_benefits", "label" : "Future Policy Benefits"},
        {"metric" : "st_debt", "label" : "Short-Term Debt"},
        {"metric" : "current_deferred_revenue", "label" : "Current Deferred Revenue"},
        {"metric" : "current_deferred_tax_liability", "label" : "Deferred Tax Liability"},
        {"metric" : "current_capital_leases", "label" : "Current Capital Leases"},
        {"metric" : "other_current_liabilities", "label" : "Other Current Liabilities"},
        # {"metric" : "total_current_liabilities", "label" : "Total Current Liabilities"},
    ],   
    "nonCurrentLiab": [
        {"metric" : "deposits_liability", "label" : "Deposits"},
        {"metric" : "lt_debt", "label" : "Long-Term Debt"},
        {"metric" : "noncurrent_capital_leases", "label" : "Capital Leases"},
        {"metric" : "pension_liabilities", "label" : "Pension Liabilities"},
        {"metric" : "noncurrent_deferred_revenue", "label" : "Deferred Revenue"},
        {"metric" : "other_lt_liabilities", "label" : "Other Liabilities"},
        # {"metric" : "total_liabilities", "label" : "Total Liabilities"},
    ],
    "equity": [
        {"metric" : "retained_earnings", "label" : "Retained Earnings"},
        {"metric" : "apic", "label" : "Paid-in Capital"},
        {"metric" : "common_stock", "label" : "Common Stock"},
        {"metric" : "preferred_stock", "label" : "Preferred Stock"},
        {"metric" : "aoci", "label" : "AOCI"},
        {"metric" : "treasury_stock", "label" : "Treasury Stock"},
        {"metric" : "other_equity", "label" : "Other"},
        {"metric" : "total_equity", "label" : "Shareholder's Equity"},
    ],
}


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


def get_financials_ts(qfs_symbol: str, model, metric: str, years: int = 10, scaling = 1):
    """
    Function that returns time series for requested metric in the following format: [{'year': 2021, 'value' : 10000}, {'year': 2022, 'value' : 20000}, etc.]
    
    para scaling:
        - can be used to scale y values; useful for percentage values like op marings, rnoa etc.
    """
    last_records = (model.objects
                    .filter(qfs_symbol_id = qfs_symbol)
                    .annotate(year=ExtractYear('period_end_date'))
                    .order_by('-period_end_date')[:years]
                    .values('year', metric)
            )
    
    #we will sort data from oldest to newest (2019, 2020, 2021)
    ts = [
        {'year': str(record['year']), 'value': record[metric]*scaling}
        for record in sorted(last_records, key=lambda x: x['year'])
    ]

    return ts


def get_op_margin_ts(qfs_symbol, n=10, scaling = 1):
    """
    Returns operating margins as a time series of the following format:
    [{'year': '2021', 'value': 0.25}, {'year': '2022', 'value': 0.27}, ...]
    """

    # Query the most recent N records for this symbol
    last_records = (
        IncomeStatementAnnual.objects
        .filter(qfs_symbol_id=qfs_symbol)
        .annotate(year=ExtractYear('period_end_date'))
        .order_by('-period_end_date')[:n]
        .values('year', 'operating_income', 'revenue')
    )

    # Compute operating margin = operating_income / revenue
    formatted_data = []
    for record in last_records:
        revenue = record.get('revenue')
        op_income = record.get('operating_income')

        if revenue not in (None, 0):
            margin = op_income / revenue
            formatted_data.append({
                'year': str(record['year']),
                'value': round(margin*scaling, 1)  # round to 1 decimals
            })

    # Sort by year ascending
    formatted_data.sort(key=lambda x: x['year'])

    return formatted_data


def get_rnoa_ts(qfs_symbol, n = 10, tax_rate = 0.3, scaling=1):
     # Step 1: fetch last n+1 balances with net_operating_assets
    balances = (
        BalanceSheetAnnual.objects
        .filter(qfs_symbol_id=qfs_symbol)
        .order_by('-period_end_date')  # latest first
        .only('period_end_date', 'net_operating_assets')
    )[:n+1]


    # Step 2: fetch corresponding income statements
    incomes = (
        IncomeStatementAnnual.objects
        .filter(qfs_symbol_id=qfs_symbol)
        .order_by('-period_end_date')  # latest first
        .only('period_end_date', 'operating_income')
    )[:n+1]

    incomes = sorted(incomes, key=lambda i: i.period_end_date)  # oldest -> newest
    balances = sorted(balances, key=lambda b: b.period_end_date)  # oldest -> newest

    # Step 3: compute RNOA using NOA from previous period
    rnoa_series = []
    for i in range(1, len(balances)):
        income_t = incomes[i]
        noa_prev = balances[i-1].net_operating_assets

        if noa_prev == 0:
            continue  # avoid division by zero

        rnoa = income_t.operating_income * (1 - tax_rate) / noa_prev
        year = income_t.period_end_date.year
        rnoa_series.append({'year': str(year), 'value': rnoa*scaling})

    # Step 4: keep only last n values
    rnoa_series = rnoa_series[-n:]

    return rnoa_series