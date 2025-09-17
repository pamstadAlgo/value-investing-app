from django.db.models import Max
from quickfs_dj.models import IncomeStatementAnnual, LatestIncomeStatementAnnual, BalanceSheetAnnual, LatestBalanceSheetAnnual
from django.forms.models import model_to_dict
from django.apps import apps
from django.db import transaction

INCOME_FIELDS_TO_EXCLUDE = ["id", "ticker"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "ticker"]

#user agents are used for web scraping
USER_AGENTS = [
    # Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Safari/537.36",
    
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",

    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Safari/537.36 Edg/122.0.2365.92",

    # Chrome on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Safari/537.36",

    # Firefox on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13.3; rv:124.0) Gecko/20100101 Firefox/124.0",

    # Safari on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",

    # Chrome on Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Safari/537.36",

    # Firefox on Linux
    "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",

    # Chrome on Android
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Mobile Safari/537.36",

    # Safari on iPhone
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",

    # Safari on iPad
    "Mozilla/5.0 (iPad; CPU OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
]

def update_operating_entries(model):
    """
    This function computes operating_asset, operating_liabilities and net_operating_assets

    para model:
        - type: django model; possible values BalanceSheetAnnual, BalanceSheetQuarter
        - descn: defines for which model the operating_assets, operating_liabilities and net_operating_assets are computed
    """
    updated_count = 0

    with transaction.atomic():
        #get all existing Balance sheet entries
        for row in model.objects.all():
            #compute operating assets
            total_assets = row.total_assets or 0
            cash = row.cash_and_equiv or 0
            st_inv = row.st_investments or 0
            equity_inv = row.equity_and_other_investments or 0

            #operating assets
            operating_assets = total_assets - cash - st_inv - equity_inv
            row.operating_assets = operating_assets

            # Compute operating_liabilities
            total_liab = row.total_liabilities or 0
            st_debt = row.st_debt or 0
            current_cl = row.current_capital_leases or 0
            lt_debt = row.lt_debt or 0
            noncurrent_cl = row.noncurrent_capital_leases or 0
            pension = row.pension_liabilities or 0

            #operating liabilities
            operating_liabilities  = total_liab - st_debt - current_cl - lt_debt - noncurrent_cl - pension
            row.operating_liabilities = operating_liabilities 

            #compute net operating assets
            row.net_operating_assets = operating_assets - operating_liabilities

            #update the fields
            row.save(update_fields=["operating_assets", "operating_liabilities", "net_operating_assets"])
            updated_count += 1

    print(f"Updated {updated_count} rows successfully.")



def update_denormalized_model(read_model, target_model, fields_to_exclude):
    """
    This function will update the denormalized models. The denormalized models are:
        1. LatestIncomeStatementAnnual
        2. LatestBalanceSheetAnnual
        3. LatestBalanceSheetQuarter
        4. etc.

    para read_model:
        type: string
        descn: This describes the model from which the original data is read and then copied to the denormalized view. For example the IncomStatementAnnual will be read_model, the LatestIncomeStatementAnnual will be the target_model

    para target_model:
        type: string
        descn: This describes the model to which the latest/most-up-to-date data will be written. So if IncomeStatementAnnual = read_model, then the target_model is LatestIncomeStatementAnnual
    
    para fields_to_exclude:
        type: list
        descn: list of fields which should be exclude when migrating an entry from read_model to target_model
    """
    #get the read model
    r_model = apps.get_model('quickfs_dj', read_model)

    #get the write model
    w_model = apps.get_model('quickfs_dj', target_model)

    # Get all ticker values and their max period end dates
    latest_periods = (
        r_model.objects.values('qfs_symbol')
        .annotate(latest_date=Max('period_end_date'))
    )

    #get field names that will be migrated; We will retrieve the first object to get the field names; 
    firstObject = r_model.objects.first()

    #defines the fields of the models
    fields = [field.name for field in firstObject._meta.fields if field.name not in fields_to_exclude]

    #iterate through all objects and create new records based on the most up-to-date annual income statements
    for entry in latest_periods:
        qfs_symbol = entry['qfs_symbol']
        latest_date = entry['latest_date']

        # Get the full record with the latest period_end_date
        latest_record = r_model.objects.filter(
            qfs_symbol=qfs_symbol, period_end_date=latest_date
        ).first()

        #convert the model object to a dictionary
        record_dict = model_to_dict(latest_record, fields=fields)

        w_model.objects.update_or_create(
            qfs_symbol=latest_record.qfs_symbol,
            defaults=record_dict
        )
