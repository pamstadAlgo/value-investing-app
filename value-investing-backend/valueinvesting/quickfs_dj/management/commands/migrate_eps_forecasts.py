from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
from quickfs_dj.management.commands.helpers import update_denormalized_model
import requests
#from .epv import migrate_valuation_data #this is from cpp package
from quickfs_dj.models import TradedCompanies, Valuation, EPSForecasts
from django.db.models import F
import random
from .helpers import USER_AGENTS
import time
import re
from bs4 import BeautifulSoup



class Command(BaseCommand):

    def get_eps_forecasts(self,ticker, qfs_symbol, max_retries = 3, backoff_factor=1.0):
        retries = 0
        current_year = self.current_year
        next_year = self.next_year
        while retries < max_retries:
            response = requests.get(self.url, headers=self.headers)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
        
                # Find the Earnings Estimate section
                earnings_section = soup.find("section", {"data-testid": "earningsEstimate"})
                
                if earnings_section:
                    #find header to extract current and next year
                    headers = earnings_section.find_all("tr")

                    for header in headers:
                        header_cells = header.find_all("th")
                        # print('these are header_cells: ', header_cells)

                        if header_cells:
                            current_year_re = re.search(r"\((\d{4})\)", header_cells[-2].text.strip())
                            next_year_re = re.search(r"\((\d{4})\)", header_cells[-1].text.strip())

                            # if current_year_re:
                            #     current_year = int(current_year_re.group(1))
                            
                            # if next_year_re:
                            #     next_year = int(next_year_re.group(1))
                            

                    #create data structure fr eps forecast
                    eps_forecast = { current_year : {'low' : 0, 'avg' : 0, 'high' : 0}, next_year : {'low' : 0, 'avg' : 0, 'high' : 0} }


                    # Find the table rows
                    rows = earnings_section.find_all("tr")
                    
                    # Extract EPS forecast for Next Year
                    for row in rows:
                        cells = row.find_all("td")

                        #search for average estimate
                        if cells and "avg" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                            next_year_eps = cells[-1].text.strip()  # Last cell is Next Year (2026)
                            
                            eps_forecast[current_year]['avg'] = float(cells[-2].text.strip())
                            eps_forecast[next_year]['avg'] = float(cells[-1].text.strip())

                            print(f"EPS forecast for Next Year (2026): {next_year_eps}")
                            #break
                        elif cells and "low" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                            eps_forecast[current_year]['low'] = float(cells[-2].text.strip())
                            eps_forecast[next_year]['low'] = float(cells[-1].text.strip())
                        elif cells and "high" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                            eps_forecast[current_year]['high'] = float(cells[-2].text.strip())
                            eps_forecast[next_year]['high'] = float(cells[-1].text.strip())
                
                    #create object for current year eps forecast
                    eps_forecast = EPSForecasts.objects.update_or_create(
                            qfs_symbol_id=qfs_symbol,
                            year=current_year,
                            low=eps_forecast[current_year]['low'],
                            avg=eps_forecast[current_year]['avg'],
                            high=eps_forecast[current_year]['high']
                        )
                    
                    #eps_forecast.save()
                    
                    #create object for next year eps forecast
                    eps_forecast = EPSForecasts.objects.update_or_create(
                            qfs_symbol_id=qfs_symbol,
                            year=next_year,
                            low=eps_forecast[next_year]['low'],
                            avg=eps_forecast[next_year]['avg'],
                            high=eps_forecast[next_year]['high']
                        )
                    break
                    #eps_forecast.save()
                else:
                    #create object for current year eps forecast
                    eps_forecast = EPSForecasts.objects.update_or_create(
                            qfs_symbol_id=qfs_symbol,
                            year=current_year,
                            low=0,
                            avg=0,
                            high=0
                        )
                    #eps_forecast.save()
                    
                    #create object for next year eps forecast
                    eps_forecast = EPSForecasts.objects.update_or_create(
                            qfs_symbol_id=qfs_symbol,
                            year=next_year,
                            low=0,
                            avg=0,
                            high=0
                        )
                    #eps_forecast.save()
                    print("Earnings Estimate section not found.")
                    break
            
            elif response.status_code == 429:
                retry_after = response.headers.get("Retry-After")
                if retry_after:
                    wait_time = int(retry_after)
                else:
                    wait_time = backoff_factor * (2 ** retries)

                print(f"429 Too Many Requests. Retrying in {wait_time:.1f} seconds...")
                time.sleep(wait_time)
                retries += 1
            else:
                #create object for current year eps forecast
                eps_forecast = EPSForecasts.objects.update_or_create(
                        qfs_symbol_id=qfs_symbol,
                        year=current_year,
                        low=0,
                        avg=0,
                        high=0
                    )
                #eps_forecast.save()
                
                #create object for next year eps forecast
                eps_forecast = EPSForecasts.objects.update_or_create(
                        qfs_symbol_id=qfs_symbol,
                        year=next_year,
                        low=0,
                        avg=0,
                        high=0
                    )
                #eps_forecast.save()

  
    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING EPS FORECASTS ###########')
         #get current and next year
        self.current_year = datetime.now().year
        self.next_year = self.current_year + 1

        qfs_symbols = list(TradedCompanies.objects.values_list('qfs_symbol', flat=True))[:10]


        for qfs_symbol in qfs_symbols:
            #extract ticker
            ticker = qfs_symbol.split(':')[0]

            print('qfs_ symbol ', qfs_symbol)

            #yahoo finance url
            self.url = f"https://finance.yahoo.com/quote/{ticker}/analysis/"

            #user-agent header to avoid being blocked by web scrapers
            self.headers = {
                "User-Agent": random.choice(USER_AGENTS)
            }

            self.get_eps_forecasts(ticker, qfs_symbol)

