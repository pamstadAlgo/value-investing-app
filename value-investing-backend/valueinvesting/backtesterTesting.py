import django
import sys
import os
# sys.path.append('/Users/chris/Documents/Python/Django/nft/')  # This path being the directory at the top of my screenshot
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()
from quickfs_dj.models import IncomeStatementAnnual, TradedCompanies


ticker_symbols = TradedCompanies.objects.all()
apple_annual_income = IncomeStatementAnnual.objects.all().order_by('period_end_date')

for income in apple_annual_income:
    print(f'revenue: {income.ticker_id}, date: {income.period_end_date}')

# for ticker in ticker_symbols:
#     print(ticker.ticker)