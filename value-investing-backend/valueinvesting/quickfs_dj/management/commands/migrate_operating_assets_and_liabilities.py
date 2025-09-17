from django.core.management.base import BaseCommand, CommandError
import os.path
from .helpers import update_operating_entries
from datetime import datetime, date
from django.db.models import Q
from quickfs_dj.models import BalanceSheetAnnual, BalanceSheetQuarter
from django.db import transaction

INCOME_FIELDS_TO_EXCLUDE = ["id", "ticker"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "ticker"]

class Command(BaseCommand):

  
    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING OPERATING ASSETS AND LIABILITIES ###########')
        print('migrating annual operating quantities')
        update_operating_entries(BalanceSheetAnnual)
        print('migrating quarterly operating quantities')
        update_operating_entries(BalanceSheetQuarter)
