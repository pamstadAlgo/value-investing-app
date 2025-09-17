
from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
#from valueinvesting.quickfs_dj.management.commands.helpers import update_denormalized_model
import requests
#from .epv import migrate_valuation_data #this is from cpp package
from quickfs_dj.models import TradedCompanies, Valuation
from django.db.models import F
import csv
import io
from django.core.mail import EmailMultiAlternatives
from django.db import connection
from django.utils.html import format_html

class Command(BaseCommand):

  
    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START PREPARING WEEKLY VALUATION EMAIL ###########')
        query = """
            SELECT qfs_symbol_id, name, industry, exchange, market_cap_q as market_cap_q,
                market_cap_q as market_cap_q,
                ((epv_per_share_ttm)-(price))/NULLIF((price),0) as _EPV___Price__Price,
                ((penman_per_share_ttm)-(price))/NULLIF((price),0) as _Penman___Price__Price,
                epv_per_share_ttm as epv_per_share_ttm,
                penman_per_share_ttm as penman_per_share_ttm,
                operating_income_y as operating_income_y,
                exchange as Exchange, industry as Industry
            FROM quickfs_dj_screenerdata
            WHERE market_cap_q >= 20000000
            AND market_cap_q <= 500000000
            AND ((epv_per_share_ttm)-(price))/NULLIF((price),0) >= 0
            AND ((penman_per_share_ttm)-(price))/NULLIF((price),0) >= 0
            AND epv_per_share_ttm != -1
            AND penman_per_share_ttm != -1
            AND operating_income_y >= 0
            AND exchange in ('Paris', 'London', 'Hamburg', 'XETRA', 'Stockholm', 'NYSEAMERICAN', 'NYSE', 'Toronto', 'NASDAQ', 'Helsinki', 'Frankfurt', 'SIX Swiss Exchange')
            AND industry not in (
                'Mortgage Real Estate Investment Trusts (REITs)', 'Diversified REITs', 'Insurance', 'N/A',
                'Asset Management', 'Banks', 'Metals & Mining', 'Unclassified', 'Oil & Gas', 'Gas Utilities',
                'Pharmaceuticals, Biotechnology and Life Sciences', 'Mortgage Real Estate Investment Trusts (REITs)',
                'Residential REITs', 'Asset Management & Securities Brokerage', 'Minerals Extraction', 'REITs',
                'Biotechnology', 'Specialized REITs', 'Retail REITs', 'Equity Real Estate Investment Trusts (REITs)',
                'Office REITs', 'Insurance Brokerage & Other', 'Equity Real Estate Investment Trusts (REITs)'
            )
            ORDER BY _EPV___Price__Price DESC
        """
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

        # Create CSV
        csv_file = io.StringIO()
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(columns)
        csv_writer.writerows(rows)
        csv_data = csv_file.getvalue()

        # Create HTML Table
        html_table = "<table border='1' cellpadding='5' cellspacing='0'><thead><tr>"
        for col in columns:
            html_table += f"<th>{col}</th>"
        html_table += "</tr></thead><tbody>"
        for row in rows:
            html_table += "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>"
        html_table += "</tbody></table>"

        # Send email
        subject = "QuickFS Screener Results"
        from_email = "your_email@example.com"
        to_email = "patrickfabianamstad@gmail.com"
        text_content = "Please find attached the screener results."
        html_content = f"<p>Please find below the results in tabular format:</p>{html_table}"

        email = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        email.attach_alternative(html_content, "text/html")
        email.attach("screener_results.csv", csv_data, "text/csv")
        email.send()

