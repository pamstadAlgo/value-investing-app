from django.core.management.base import BaseCommand, CommandError
from quickfs_dj.models import (
    ScreenerData, Valuation, IncomeStatementAnnual, 
    BalanceSheetAnnual, BalanceSheetQuarter, CashFlowStatementAnnual, TradedCompanies, KeyRatiosAnnual, KeyRatiosQuarter
)
from django.db import transaction
from django.db.models.fields import NOT_PROVIDED
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta  # more accurate than timedelta for months


class Command(BaseCommand):

    def get_updatable_fields(self, model):
        update_fields = []
        for field in model._meta.get_fields():
            # Skip many-to-many, related fields, and auto fields
            if field.many_to_many or field.auto_created or not hasattr(field, 'attname'):
                continue
            if not field.editable or field.primary_key:
                continue
            update_fields.append(field.attname)
        return update_fields

    def add_arguments(self, parser):
        #example command: python manage.py migrate_denormalized_models --type IncomeAnnual
        parser.add_argument("-t", "--type", type=str) #defines for which model the denormalized view should get updated

    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING SCREENER DATA MODELS ###########')
        screener_data_list = []
        companies = TradedCompanies.objects.values_list('qfs_symbol', flat=True)
        cutoff_date = date.today() - relativedelta(months=8)

        print('this is cutoff_date: ', cutoff_date)

        for company in companies:
            # Fetch latest entries from each model for the company
            valuation_data = Valuation.objects.filter(qfs_symbol_id=company).order_by('-valuation_date').first()
            income_statement = IncomeStatementAnnual.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            balance_sheet_annual = BalanceSheetAnnual.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            balance_sheet_quarter = BalanceSheetQuarter.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            cash_flow_annual = CashFlowStatementAnnual.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            key_ratios_q = KeyRatiosQuarter.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            key_ratios_annual = KeyRatiosAnnual.objects.filter(qfs_symbol_id=company).order_by('-period_end_date').first()
            traded_company = TradedCompanies.objects.get(qfs_symbol=company)

            #if most recent filling is older than 8 month we skip this company
            if key_ratios_q.period_end_date < cutoff_date:
                continue

            defaults = {}

            #add traded company fields
            if traded_company:
                defaults.update({
                    'ticker' : traded_company.ticker,
                    'exchange' : traded_company.exchange,
                    'name' : traded_company.name,
                    'industry' : traded_company.industry,
                })

            if valuation_data:
                defaults.update({
                    'epv_business': valuation_data.epv_business,
                    'epv_per_share': valuation_data.epv_per_share,
                    'epv_business_ttm': valuation_data.epv_business_ttm,
                    'epv_per_share_ttm': valuation_data.epv_per_share_ttm,
                    'penman_equity': valuation_data.penman_equity,
                    'penman_per_share': valuation_data.penman_per_share,
                    'penman_g': valuation_data.penman_g,
                    'rnoa': valuation_data.rnoa,
                    'penman_equity_ttm': valuation_data.penman_equity_ttm,
                    'penman_per_share_ttm': valuation_data.penman_per_share_ttm,
                    'penman_g_ttm': valuation_data.penman_g_ttm,
                    'rnoa_ttm': valuation_data.rnoa_ttm,
                    'price': valuation_data.price,
                })

            if income_statement:
                defaults.update({
                    'revenue_y': income_statement.revenue,
                    'cogs_y': income_statement.cogs,
                    'gross_profit_y': income_statement.gross_profit,
                    'sga_y': income_statement.sga,
                    'rnd_y': income_statement.rnd,
                    'special_charges_y': income_statement.special_charges,
                    'other_opex_y': income_statement.other_opex,
                    'total_opex_y': income_statement.total_opex,
                    'operating_income_y': income_statement.operating_income,
                    'interest_income_y': income_statement.interest_income,
                    'interest_expense_y': income_statement.interest_expense,
                    'net_interest_income_normal_y': income_statement.net_interest_income_normal,
                    'other_nonoperating_income_y': income_statement.other_nonoperating_income,
                    'pretax_income_y': income_statement.pretax_income,
                    'income_tax_y': income_statement.income_tax,
                    'net_income_continuing_y': income_statement.net_income_continuing,
                    'net_income_discontinued_y': income_statement.net_income_discontinued,
                    'income_allocated_to_minority_interest_y': income_statement.income_allocated_to_minority_interest,
                    'other_income_statement_items_y': income_statement.other_income_statement_items,
                    'net_income_y': income_statement.net_income,
                    'preferred_dividends_y': income_statement.preferred_dividends,
                    'net_income_available_to_shareholders_y': income_statement.net_income_available_to_shareholders,
                    'eps_basic_y': income_statement.eps_basic,
                    'eps_diluted_y': income_statement.eps_diluted,
                    'shares_basic_y': income_statement.shares_basic,
                    'shares_diluted_y': income_statement.shares_diluted,
                })

            if balance_sheet_annual:
                defaults.update({
                    'cash_and_equiv_y': balance_sheet_annual.cash_and_equiv,
                    'st_investments_y': balance_sheet_annual.st_investments,
                    'receivables_y': balance_sheet_annual.receivables,
                    'inventories_y': balance_sheet_annual.inventories,
                    'other_current_assets_y': balance_sheet_annual.other_current_assets,
                    'total_current_assets_y': balance_sheet_annual.total_current_assets,
                    'equity_and_other_investments_y': balance_sheet_annual.equity_and_other_investments,
                    'ppe_gross_y': balance_sheet_annual.ppe_gross,
                    'accumulated_depreciation_y': balance_sheet_annual.accumulated_depreciation,
                    'ppe_net_y': balance_sheet_annual.ppe_net,
                    'intangible_assets_y': balance_sheet_annual.intangible_assets,
                    'goodwill_y': balance_sheet_annual.goodwill,
                    'other_lt_assets_y': balance_sheet_annual.other_lt_assets,
                    'total_assets_y': balance_sheet_annual.total_assets,
                    'accounts_payable_y': balance_sheet_annual.accounts_payable,
                    'tax_payable_y': balance_sheet_annual.tax_payable,
                    'current_accrued_liabilities_y': balance_sheet_annual.current_accrued_liabilities,
                    'st_debt_y': balance_sheet_annual.st_debt,
                    'current_deferred_revenue_y': balance_sheet_annual.current_deferred_revenue,
                    'current_deferred_tax_liability_y': balance_sheet_annual.current_deferred_tax_liability,
                    'current_capital_leases_y': balance_sheet_annual.current_capital_leases,
                    'other_current_liabilities_y': balance_sheet_annual.other_current_liabilities,
                    'total_current_liabilities_y': balance_sheet_annual.total_current_liabilities,
                    'lt_debt_y': balance_sheet_annual.lt_debt,
                    'noncurrent_capital_leases_y': balance_sheet_annual.noncurrent_capital_leases,
                    'pension_liabilities_y': balance_sheet_annual.pension_liabilities,
                    'noncurrent_deferred_revenue_y': balance_sheet_annual.noncurrent_deferred_revenue,
                    'other_lt_liabilities_y': balance_sheet_annual.other_lt_liabilities,
                    'total_liabilities_y': balance_sheet_annual.total_liabilities,
                    'common_stock_y': balance_sheet_annual.common_stock,
                    'preferred_stock_y': balance_sheet_annual.preferred_stock,
                    'retained_earnings_y': balance_sheet_annual.retained_earnings,
                    'aoci_y': balance_sheet_annual.aoci,
                    'apic_y': balance_sheet_annual.apic,
                    'treasury_stock_y': balance_sheet_annual.treasury_stock,
                    'other_equity_y': balance_sheet_annual.other_equity,
                    'minority_interest_liability_y': balance_sheet_annual.minority_interest_liability,
                    'total_equity_y': balance_sheet_annual.total_equity,
                    'total_liabilities_and_equity_y': balance_sheet_annual.total_liabilities_and_equity,
                })

            if balance_sheet_quarter:
                defaults.update({
                    'cash_and_equiv_q': balance_sheet_quarter.cash_and_equiv,
                    'st_investments_q': balance_sheet_quarter.st_investments,
                    'receivables_q': balance_sheet_quarter.receivables,
                    'inventories_q': balance_sheet_quarter.inventories,
                    'other_current_assets_q': balance_sheet_quarter.other_current_assets,
                    'total_current_assets_q': balance_sheet_quarter.total_current_assets,
                    'equity_and_other_investments_q': balance_sheet_quarter.equity_and_other_investments,
                    'ppe_gross_q': balance_sheet_quarter.ppe_gross,
                    'accumulated_depreciation_q': balance_sheet_quarter.accumulated_depreciation,
                    'ppe_net_q': balance_sheet_quarter.ppe_net,
                    'intangible_assets_q': balance_sheet_quarter.intangible_assets,
                    'goodwill_q': balance_sheet_quarter.goodwill,
                    'other_lt_assets_q': balance_sheet_quarter.other_lt_assets,
                    'total_assets_q': balance_sheet_quarter.total_assets,
                    'accounts_payable_q': balance_sheet_quarter.accounts_payable,
                    'tax_payable_q': balance_sheet_quarter.tax_payable,
                    'current_accrued_liabilities_q': balance_sheet_quarter.current_accrued_liabilities,
                    'st_debt_q': balance_sheet_quarter.st_debt,
                    'current_deferred_revenue_q': balance_sheet_quarter.current_deferred_revenue,
                    'current_deferred_tax_liability_q': balance_sheet_quarter.current_deferred_tax_liability,
                    'current_capital_leases_q': balance_sheet_quarter.current_capital_leases,
                    'other_current_liabilities_q': balance_sheet_quarter.other_current_liabilities,
                    'total_current_liabilities_q': balance_sheet_quarter.total_current_liabilities,
                    'lt_debt_q': balance_sheet_quarter.lt_debt,
                    'noncurrent_capital_leases_q': balance_sheet_quarter.noncurrent_capital_leases,
                    'pension_liabilities_q': balance_sheet_quarter.pension_liabilities,
                    'noncurrent_deferred_revenue_q': balance_sheet_quarter.noncurrent_deferred_revenue,
                    'other_lt_liabilities_q': balance_sheet_quarter.other_lt_liabilities,
                    'total_liabilities_q': balance_sheet_quarter.total_liabilities,
                    'common_stock_q': balance_sheet_quarter.common_stock,
                    'preferred_stock_q': balance_sheet_quarter.preferred_stock,
                    'retained_earnings_q': balance_sheet_quarter.retained_earnings,
                    'aoci_q': balance_sheet_quarter.aoci,
                    'apic_q': balance_sheet_quarter.apic,
                    'treasury_stock_q': balance_sheet_quarter.treasury_stock,
                    'other_equity_q': balance_sheet_quarter.other_equity,
                })

            if cash_flow_annual:
                defaults.update({
                    # CFO
                    'cfo_net_income_y': cash_flow_annual.cfo_net_income,
                    'cfo_da_y': cash_flow_annual.cfo_da,
                    'cfo_receivables_y': cash_flow_annual.cfo_receivables,
                    'cfo_inventory_y': cash_flow_annual.cfo_inventory,
                    'cfo_prepaid_expenses_y': cash_flow_annual.cfo_prepaid_expenses,
                    'cfo_other_working_capital_y': cash_flow_annual.cfo_other_working_capital,
                    'cfo_change_in_working_capital_y': cash_flow_annual.cfo_change_in_working_capital,
                    'cfo_deferred_tax_y': cash_flow_annual.cfo_deferred_tax,
                    'cfo_stock_comp_y': cash_flow_annual.cfo_stock_comp,
                    'cfo_other_noncash_items_y': cash_flow_annual.cfo_other_noncash_items,
                    'cf_cfo_y': cash_flow_annual.cf_cfo,

                    # CFI
                    'cfi_ppe_purchases_y': cash_flow_annual.cfi_ppe_purchases,
                    'cfi_ppe_sales_y': cash_flow_annual.cfi_ppe_sales,
                    'cfi_ppe_net_y': cash_flow_annual.cfi_ppe_net,
                    'cfi_acquisitions_y': cash_flow_annual.cfi_acquisitions,
                    'cfi_divestitures_y': cash_flow_annual.cfi_divestitures,
                    'cfi_acquisitions_net_y': cash_flow_annual.cfi_acquisitions_net,
                    'cfi_investment_purchases_y': cash_flow_annual.cfi_investment_purchases,
                    'cfi_investment_sales_y': cash_flow_annual.cfi_investment_sales,
                    'cfi_investment_net_y': cash_flow_annual.cfi_investment_net,
                    'cfi_intangibles_net_y': cash_flow_annual.cfi_intangibles_net,
                    'cfi_other_y': cash_flow_annual.cfi_other,
                    'cf_cfi_y': cash_flow_annual.cf_cfi,

                    # CFF
                    'cff_common_stock_issued_y': cash_flow_annual.cff_common_stock_issued,
                    'cff_common_stock_repurchased_y': cash_flow_annual.cff_common_stock_repurchased,
                    'cff_common_stock_net_y': cash_flow_annual.cff_common_stock_net,
                    'cff_pfd_issued_y': cash_flow_annual.cff_pfd_issued,
                    'cff_pfd_repurchased_y': cash_flow_annual.cff_pfd_repurchased,
                    'cff_pfd_net_y': cash_flow_annual.cff_pfd_net,
                    'cff_debt_issued_y': cash_flow_annual.cff_debt_issued,
                    'cff_debt_repaid_y': cash_flow_annual.cff_debt_repaid,
                    'cff_debt_net_y': cash_flow_annual.cff_debt_net,
                    'cff_dividend_paid_y': cash_flow_annual.cff_dividend_paid,
                    'cff_other_y': cash_flow_annual.cff_other,
                    'cf_cff_y': cash_flow_annual.cf_cff,
                })

            if key_ratios_q:
                defaults.update({
                    'market_cap_q': key_ratios_q.market_cap,
                    'period_end_price_q': key_ratios_q.period_end_price,
                    'enterprise_value_q': key_ratios_q.enterprise_value,
                    'book_value_q': key_ratios_q.book_value,
                    'tangible_book_value_q': key_ratios_q.tangible_book_value,
                    'price_to_earnings_q': key_ratios_q.price_to_earnings,
                    'price_to_book_q': key_ratios_q.price_to_book,
                    'price_to_sales_q': key_ratios_q.price_to_sales,
                    'price_to_tangible_book_q': key_ratios_q.price_to_tangible_book,
                    'price_to_fcf_q': key_ratios_q.price_to_fcf,
                    'price_to_pretax_income_q': key_ratios_q.price_to_pretax_income,
                    'enterprise_value_to_earnings_q': key_ratios_q.enterprise_value_to_earnings,
                    'enterprise_value_to_book_q': key_ratios_q.enterprise_value_to_book,
                    'enterprise_value_to_tangible_book_q': key_ratios_q.enterprise_value_to_tangible_book,
                    'enterprise_value_to_sales_q': key_ratios_q.enterprise_value_to_sales,
                    'enterprise_value_to_fcf_q': key_ratios_q.enterprise_value_to_fcf,
                    'enterprise_value_to_pretax_income_q': key_ratios_q.enterprise_value_to_pretax_income,
                    'ebitda_q': key_ratios_q.ebitda,
                    'capex_q': key_ratios_q.capex,
                    'fcf_q': key_ratios_q.fcf,
                    'earning_assets_q': key_ratios_q.earning_assets,
                    'policy_revenue_q': key_ratios_q.policy_revenue,
                    'underwriting_profit_q': key_ratios_q.underwriting_profit,
                    'dividends_q': key_ratios_q.dividends,
                    'payout_ratio_q': key_ratios_q.payout_ratio,
                    'income_tax_rate_q': key_ratios_q.income_tax_rate,
                    'net_debt_q': key_ratios_q.net_debt,
                    'gross_margin_q': key_ratios_q.gross_margin,
                    'ebitda_margin_q': key_ratios_q.ebitda_margin,
                    'operating_margin_q': key_ratios_q.operating_margin,
                    'pretax_margin_q': key_ratios_q.pretax_margin,
                    'net_income_margin_q': key_ratios_q.net_income_margin,
                    'fcf_margin_q': key_ratios_q.fcf_margin,
                    'net_interest_margin_q': key_ratios_q.net_interest_margin,
                    'underwriting_margin_q': key_ratios_q.underwriting_margin,
                    'roe_q': key_ratios_q.roe,
                    'roa_q': key_ratios_q.roa,
                    'roic_q': key_ratios_q.roic,
                    'roic_legacy_q': key_ratios_q.roic_legacy,
                    'roce_q': key_ratios_q.roce,
                    'rotce_q': key_ratios_q.rotce,
                    'roi_q': key_ratios_q.roi,
                    'debt_to_equity_q': key_ratios_q.debt_to_equity,
                    'equity_to_assets_q': key_ratios_q.equity_to_assets,
                    'debt_to_assets_q': key_ratios_q.debt_to_assets,
                    'assets_to_equity_q': key_ratios_q.assets_to_equity,
                    'current_ratio_q': key_ratios_q.current_ratio,
                    'earning_assets_to_equity_q': key_ratios_q.earning_assets_to_equity,
                    'loans_to_deposits_q': key_ratios_q.loans_to_deposits,
                    'loan_loss_reserve_to_loans_q': key_ratios_q.loan_loss_reserve_to_loans,
                    'revenue_per_share_q': key_ratios_q.revenue_per_share,
                    'ebitda_per_share_q': key_ratios_q.ebitda_per_share,
                    'operating_income_per_share_q': key_ratios_q.operating_income_per_share,
                    'pretax_income_per_share_q': key_ratios_q.pretax_income_per_share,
                    'fcf_per_share_q': key_ratios_q.fcf_per_share,
                    'book_value_per_share_q': key_ratios_q.book_value_per_share,
                    'tangible_book_per_share_q': key_ratios_q.tangible_book_per_share,
                    'premiums_per_share_q': key_ratios_q.premiums_per_share,
                    'revenue_growth_q': key_ratios_q.revenue_growth,
                    'gross_profit_growth_q': key_ratios_q.gross_profit_growth,
                    'ebitda_growth_q': key_ratios_q.ebitda_growth,
                    'operating_income_growth_q': key_ratios_q.operating_income_growth,
                    'pretax_income_growth_q': key_ratios_q.pretax_income_growth,
                    'net_income_growth_q': key_ratios_q.net_income_growth,
                    'eps_diluted_growth_q': key_ratios_q.eps_diluted_growth,
                    'shares_diluted_growth_q': key_ratios_q.shares_diluted_growth,
                    'shares_eop_growth_q': key_ratios_q.shares_eop_growth,
                    'cash_and_equiv_growth_q': key_ratios_q.cash_and_equiv_growth,
                    'ppe_growth_q': key_ratios_q.ppe_growth,
                    'total_assets_growth_q': key_ratios_q.total_assets_growth,
                    'total_equity_growth_q': key_ratios_q.total_equity_growth,
                    'cfo_growth_q': key_ratios_q.cfo_growth,
                    'capex_growth_q': key_ratios_q.capex_growth,
                    'fcf_growth_q': key_ratios_q.fcf_growth,
                    'revenue_cagr_10_q': key_ratios_q.revenue_cagr_10,
                    'eps_diluted_cagr_10_q': key_ratios_q.eps_diluted_cagr_10,
                    'total_assets_cagr_10_q': key_ratios_q.total_assets_cagr_10,
                    'total_equity_cagr_10_q': key_ratios_q.total_equity_cagr_10,
                    'cf_cfo_cagr_10_q': key_ratios_q.cf_cfo_cagr_10,
                    'fcf_cagr_10_q': key_ratios_q.fcf_cagr_10,
                })

            if key_ratios_annual:
                defaults.update({
                    'market_cap_y': key_ratios_annual.market_cap,
                    'period_end_price_y': key_ratios_annual.period_end_price,
                    'enterprise_value_y': key_ratios_annual.enterprise_value,
                    'book_value_y': key_ratios_annual.book_value,
                    'tangible_book_value_y': key_ratios_annual.tangible_book_value,
                    'price_to_earnings_y': key_ratios_annual.price_to_earnings,
                    'price_to_book_y': key_ratios_annual.price_to_book,
                    'price_to_sales_y': key_ratios_annual.price_to_sales,
                    'price_to_tangible_book_y': key_ratios_annual.price_to_tangible_book,
                    'price_to_fcf_y': key_ratios_annual.price_to_fcf,
                    'price_to_pretax_income_y': key_ratios_annual.price_to_pretax_income,
                    'enterprise_value_to_earnings_y': key_ratios_annual.enterprise_value_to_earnings,
                    'enterprise_value_to_book_y': key_ratios_annual.enterprise_value_to_book,
                    'enterprise_value_to_tangible_book_y': key_ratios_annual.enterprise_value_to_tangible_book,
                    'enterprise_value_to_sales_y': key_ratios_annual.enterprise_value_to_sales,
                    'enterprise_value_to_fcf_y': key_ratios_annual.enterprise_value_to_fcf,
                    'enterprise_value_to_pretax_income_y': key_ratios_annual.enterprise_value_to_pretax_income,
                    'ebitda_y': key_ratios_annual.ebitda,
                    'capex_y': key_ratios_annual.capex,
                    'fcf_y': key_ratios_annual.fcf,
                    'earning_assets_y': key_ratios_annual.earning_assets,
                    'policy_revenue_y': key_ratios_annual.policy_revenue,
                    'underwriting_profit_y': key_ratios_annual.underwriting_profit,
                    'dividends_y': key_ratios_annual.dividends,
                    'payout_ratio_y': key_ratios_annual.payout_ratio,
                    'income_tax_rate_y': key_ratios_annual.income_tax_rate,
                    'net_debt_y': key_ratios_annual.net_debt,
                    'gross_margin_y': key_ratios_annual.gross_margin,
                    'ebitda_margin_y': key_ratios_annual.ebitda_margin,
                    'operating_margin_y': key_ratios_annual.operating_margin,
                    'pretax_margin_y': key_ratios_annual.pretax_margin,
                    'net_income_margin_y': key_ratios_annual.net_income_margin,
                    'fcf_margin_y': key_ratios_annual.fcf_margin,
                    'net_interest_margin_y': key_ratios_annual.net_interest_margin,
                    'underwriting_margin_y': key_ratios_annual.underwriting_margin,
                    'roe_y': key_ratios_annual.roe,
                    'roa_y': key_ratios_annual.roa,
                    'roic_y': key_ratios_annual.roic,
                    'roic_legacy_y': key_ratios_annual.roic_legacy,
                    'roce_y': key_ratios_annual.roce,
                    'rotce_y': key_ratios_annual.rotce,
                    'roi_y': key_ratios_annual.roi,
                    'debt_to_equity_y': key_ratios_annual.debt_to_equity,
                    'debt_to_assets_y': key_ratios_annual.debt_to_assets,
                    'equity_to_assets_y': key_ratios_annual.equity_to_assets,
                    'assets_to_equity_y': key_ratios_annual.assets_to_equity,
                    'current_ratio_y': key_ratios_annual.current_ratio,
                    'earning_assets_to_equity_y': key_ratios_annual.earning_assets_to_equity,
                    'loans_to_deposits_y': key_ratios_annual.loans_to_deposits,
                    'loan_loss_reserve_to_loans_y': key_ratios_annual.loan_loss_reserve_to_loans,
                    'revenue_per_share_y': key_ratios_annual.revenue_per_share,
                    'ebitda_per_share_y': key_ratios_annual.ebitda_per_share,
                    'operating_income_per_share_y': key_ratios_annual.operating_income_per_share,
                    'pretax_income_per_share_y': key_ratios_annual.pretax_income_per_share,
                    'fcf_per_share_y': key_ratios_annual.fcf_per_share,
                    'book_value_per_share_y': key_ratios_annual.book_value_per_share,
                    'tangible_book_per_share_y': key_ratios_annual.tangible_book_per_share,
                    'premiums_per_share_y': key_ratios_annual.premiums_per_share,
                    'revenue_growth_y': key_ratios_annual.revenue_growth,
                    'gross_profit_growth_y': key_ratios_annual.gross_profit_growth,
                    'ebitda_growth_y': key_ratios_annual.ebitda_growth,
                    'operating_income_growth_y': key_ratios_annual.operating_income_growth,
                    'pretax_income_growth_y': key_ratios_annual.pretax_income_growth,
                    'net_income_growth_y': key_ratios_annual.net_income_growth,
                    'eps_diluted_growth_y': key_ratios_annual.eps_diluted_growth,
                    'shares_diluted_growth_y': key_ratios_annual.shares_diluted_growth,
                    'shares_eop_growth_y': key_ratios_annual.shares_eop_growth,
                    'cash_and_equiv_growth_y': key_ratios_annual.cash_and_equiv_growth,
                    'ppe_growth_y': key_ratios_annual.ppe_growth,
                    'total_assets_growth_y': key_ratios_annual.total_assets_growth,
                    'total_equity_growth_y': key_ratios_annual.total_equity_growth,
                    'cfo_growth_y': key_ratios_annual.cfo_growth,
                    'capex_growth_y': key_ratios_annual.capex_growth,
                    'fcf_growth_y': key_ratios_annual.fcf_growth,
                    'revenue_cagr_10_y': key_ratios_annual.revenue_cagr_10,
                    'eps_diluted_cagr_10_y': key_ratios_annual.eps_diluted_cagr_10,
                    'total_assets_cagr_10_y': key_ratios_annual.total_assets_cagr_10,
                    'total_equity_cagr_10_y': key_ratios_annual.total_equity_cagr_10,
                    'cf_cfo_cagr_10_y': key_ratios_annual.cf_cfo_cagr_10,
                    'fcf_cagr_10_y': key_ratios_annual.fcf_cagr_10,
                    'rnoa_y': key_ratios_annual.rnoa,
                })

            # Prepare the ScreenerData object
            screener_data = ScreenerData(qfs_symbol_id=company, **defaults)
            screener_data_list.append(screener_data)

        #get all fields of ScreenerData model which are updateable
        updatable_fields = self.get_updatable_fields(ScreenerData)

        #bulk create or update entries
        ScreenerData.objects.bulk_create(
            screener_data_list,
            update_conflicts=True,
            update_fields=updatable_fields,
            unique_fields=['qfs_symbol_id'],  # assuming this is your unique constraint
            batch_size=200
        )