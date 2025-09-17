from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
#from valueinvesting.quickfs_dj.management.commands.helpers import update_denormalized_model
from .helpers import update_denormalized_model
import requests

INCOME_FIELDS_TO_EXCLUDE = ["id", "qfs_symbol"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "qfs_symbol"]

class Command(BaseCommand):

    def add_arguments(self, parser):
        #example command: python manage.py migrate_denormalized_models --type IncomeAnnual
        parser.add_argument("-t", "--type", type=str) #defines for which model the denormalized view should get updated

    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING DENORMALIZED MODELS ###########')
        model = options["type"]

        #if no type was provided we set it to all
        if model is None:
            print(f'no migration type was provided, we set it to ALL')
            model = 'ALL'
        else:
            print(f'migration type: {model}')

        if model:
            if model == "IncomeAnnual":
                update_denormalized_model(read_model="IncomeStatementAnnual", target_model="LatestIncomeStatementAnnual", fields_to_exclude=INCOME_FIELDS_TO_EXCLUDE)
            elif model == "BalanceAnnual":
                update_denormalized_model(read_model="BalanceSheetAnnual", target_model="LatestBalanceSheetAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
            elif model == "BalanceQuarter":
                update_denormalized_model(read_model="BalanceSheetQuarter", target_model="LatestBalanceSheetQuarter", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
            elif model == "CashFlowAnnual":
                update_denormalized_model(read_model="CashFlowStatementAnnual", target_model="LatestCashFlowStatementAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
            elif model == "KeyRatiosAnnual":
                update_denormalized_model(read_model="KeyRatiosAnnual", target_model="LatestKeyRatiosAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
            elif model == "KeyRatiosQuarter":
                update_denormalized_model(read_model="KeyRatiosQuarter", target_model="LatestKeyRatiosQuarter", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
            elif model == "ALL":
                print("IncomeAnnualStarted")
                update_denormalized_model(read_model="IncomeStatementAnnual", target_model="LatestIncomeStatementAnnual", fields_to_exclude=INCOME_FIELDS_TO_EXCLUDE)
                print("BalanceAnnualStarted")
                update_denormalized_model(read_model="BalanceSheetAnnual", target_model="LatestBalanceSheetAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
                print("BalanceQuarterStarted")
                update_denormalized_model(read_model="BalanceSheetQuarter", target_model="LatestBalanceSheetQuarter", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
                print("CashFlowStarted")
                update_denormalized_model(read_model="CashFlowStatementAnnual", target_model="LatestCashFlowStatementAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
                print("KeyRatiosStarted")
                update_denormalized_model(read_model="KeyRatiosAnnual", target_model="LatestKeyRatiosAnnual", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
                print("KeyRatiosQuarterf")
                update_denormalized_model(read_model="KeyRatiosQuarter", target_model="LatestKeyRatiosQuarter", fields_to_exclude=BALANCE_FIELDS_TO_EXCLUDE)
        else:
            raise Exception(f"type parameter has invalid value: {model}")

