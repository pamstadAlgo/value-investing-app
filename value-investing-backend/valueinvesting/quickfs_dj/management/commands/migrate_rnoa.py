from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
from quickfs_dj.models import BalanceSheetAnnual, TradedCompanies, IncomeStatementAnnual, KeyRatiosAnnual
from django.db import transaction
from collections import defaultdict

INCOME_FIELDS_TO_EXCLUDE = ["id", "ticker"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "ticker"]

class Command(BaseCommand):

  
    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        tax_rate = 0.3
        #qfs_symbol_to_test = 'QSG:US'

        print("Loading data...")
        # income_statements = IncomeStatementAnnual.objects.filter(qfs_symbol=qfs_symbol_to_test).values(
        #     'qfs_symbol', 'period_end_date', 'operating_income'
        # ).order_by('qfs_symbol', '-period_end_date')
        income_statements = IncomeStatementAnnual.objects.values(
            'qfs_symbol', 'period_end_date', 'operating_income'
        ).order_by('qfs_symbol', '-period_end_date')

        # balance_sheets = BalanceSheetAnnual.objects.filter(qfs_symbol=qfs_symbol_to_test).values(
        #     'qfs_symbol', 'period_end_date', 'net_operating_assets'
        # ).order_by('qfs_symbol', '-period_end_date')
        balance_sheets = BalanceSheetAnnual.objects.values(
            'qfs_symbol', 'period_end_date', 'net_operating_assets'
        ).order_by('qfs_symbol', '-period_end_date')

        print("Organizing data in memory...")
        income_by_symbol = defaultdict(list)
        noa_by_symbol = defaultdict(list)

        for row in income_statements:
            if row['operating_income'] is not None:
                income_by_symbol[row['qfs_symbol']].append(row)

        for row in balance_sheets:
            if row['net_operating_assets'] is not None:
                noa_by_symbol[row['qfs_symbol']].append((row['period_end_date'], row['net_operating_assets']))

        new_ratios = []
        updated_ratios = []

        #get total number of symbols
        total = len(income_by_symbol)

        print("Computing RNOA...")
        #for qfs_symbol, income_rows in income_by_symbol.items():
        for idx, (qfs_symbol, income_rows) in enumerate(income_by_symbol.items(), start=1):
            noa_history = sorted(noa_by_symbol.get(qfs_symbol, []), key=lambda x: x[0], reverse=True) #reverse True will sort in descending order

            if idx % 1000 == 0 or idx == total:
                progress = (idx / total) * 100
                print(f"Progress: {progress:.2f}% ({idx}/{total})")

            for row in income_rows:
                period_t = row['period_end_date']
                operating_income = row['operating_income']

                #get last two noa entries to compute an average
                prev_noas = [
                    noa for date_, noa in noa_history if date_ < period_t
                ][:2]  # take at most 2 entries

                if not prev_noas or all(noa == 0 for noa in prev_noas):
                    continue  # skip if no valid NOA values

                avg_prev_noa = sum(prev_noas) / len(prev_noas)

                if avg_prev_noa == 0:
                    continue  # just in case

                #if noa is negative it does not make sense to compute rnoa. we will set it to zero
                if avg_prev_noa < 0:
                    rnoa = 0
                else:
                    rnoa = operating_income * (1 - tax_rate) / avg_prev_noa

                # Try to update or insert RNOA
                try:
                    kr = KeyRatiosAnnual.objects.get(qfs_symbol=qfs_symbol, period_end_date=period_t)
                    kr.rnoa = rnoa
                    updated_ratios.append(kr)
                except KeyRatiosAnnual.DoesNotExist:
                    print('key ratio does not exist. period_date; {period_t}, qfs_symobl: {qfs_symbol}')


        print(f"Saving {len(updated_ratios)} updated and {len(new_ratios)} new KeyRatiosAnnual rows...")

        if updated_ratios:
            KeyRatiosAnnual.objects.bulk_update(updated_ratios, ['rnoa'], batch_size=1000)
        if new_ratios:
            KeyRatiosAnnual.objects.bulk_create(new_ratios, batch_size=1000)

        print("Done.")

