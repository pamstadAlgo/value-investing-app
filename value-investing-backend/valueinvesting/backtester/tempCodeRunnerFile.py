try:
#     key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2021-09-01')
#     balance_sheet_quart = BalanceSheetQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2021-09-01')
#     print(f'market cap: {key_ratios_quart.market_cap}')
#     print(f'total debt: {balance_sheet_quart.st_debt + balance_sheet_quart.lt_debt}')
#     print(f'preferred stock: {balance_sheet_quart.preferred_stock}')
#     print(f'minority interest: {balance_sheet_quart.minority_interest_liability}')
#     print(f'excess cash: {balance_sheet_quart.total_current_assets - balance_sheet_quart.total_current_liabilities}')

# except ObjectDoesNotExist:
#     raise Exception(f'En')