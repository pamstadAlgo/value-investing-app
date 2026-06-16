"""
EODHD → Django model field mappings.
Field names verified against a real EODHD fundamentals response (AAPL, June 2026).

EODHD quirks (intentional — these are the real field names):
  "goodWill"               capital W
  "capitalSurpluse"        missing trailing 's'
  "nonCurrrentAssetsOther" three r's

EODHD fields that look useful but are NOT what they seem:
  "otherOperatingExpenses" = COGS + SGA + RND (a total, not a residual) — not mapped
"""


# ── Helpers ────────────────────────────────────────────────────────────────────

def _float(v):
    """Convert an EODHD numeric string (or None) to float."""
    try:
        return float(v) if v is not None else None
    except (ValueError, TypeError):
        return None


def _sum_nullable(*values):
    """Sum numeric values, treating None as zero. Returns None if all inputs are None."""
    floats = [_float(v) for v in values]
    non_null = [f for f in floats if f is not None]
    return sum(non_null) if non_null else None


# ── TradedCompanies ────────────────────────────────────────────────────────────

def transform_traded_company(general: dict, exchange_code: str) -> dict:
    """
    Maps General section → TradedCompanies model row.
    qfs_symbol = PrimaryTicker  e.g. "AAPL.US"
    ticker     = Code           e.g. "AAPL"
    exchange   = exchange_code  e.g. "US"  (the EODHD exchange code, not General.Exchange
                                which returns the operating mic e.g. "NASDAQ")
    """
    primary_ticker = general.get("PrimaryTicker") or (
        f"{general['Code']}.{exchange_code}"
    )
    return {
        "qfs_symbol":   primary_ticker,
        "ticker":       general.get("Code"),
        "exchange":     exchange_code,
        "name":         general.get("Name"),
        "company_type": general.get("Type"),
        "currency":     general.get("CurrencyCode"),
        "industry":     general.get("Industry"),
        # has_new_financials defaults to True in the model
        # last_close_price is populated separately by migrate_close_prices.py
    }


# ── Income Statement ───────────────────────────────────────────────────────────

def transform_income_statement(raw: dict, qfs_symbol: str) -> dict:
    """
    Maps one EODHD Income_Statement period dict → IncomeStatementAnnual / Quarter row.
    Fields the provider does not supply are explicitly set to None.
    """
    return {
        "qfs_symbol_id":                                        qfs_symbol,
        "period_end_date":                                      raw["date"],

        # Core P&L
        "revenue":                                              _float(raw.get("totalRevenue")),
        "cogs":                                                 _float(raw.get("costOfRevenue")),
        "gross_profit":                                         _float(raw.get("grossProfit")),
        "sga":                                                  _float(raw.get("sellingGeneralAdministrative")),
        "rnd":                                                  _float(raw.get("researchDevelopment")),
        # nonRecurring + extraordinaryItems is the closest split EODHD provides
        "special_charges":                                      _sum_nullable(
                                                                    raw.get("nonRecurring"),
                                                                    raw.get("extraordinaryItems"),
                                                                ),
        # otherOperatingExpenses in EODHD = COGS+SGA+RND (a total, not a residual) — not mapped
        "other_opex":                                           None,
        "total_opex":                                           _float(raw.get("totalOperatingExpenses")),
        "operating_income":                                     _float(raw.get("operatingIncome")),

        # Interest / non-operating
        "interest_income":                                      _float(raw.get("interestIncome")),
        "interest_expense":                                     _float(raw.get("interestExpense")),
        # net_interest_income_normal: maps netInterestIncome; None for non-banks
        "net_interest_income_normal":                           _float(raw.get("netInterestIncome")),
        # totalOtherIncomeExpenseNet is the net non-operating income line
        "other_nonoperating_income":                            _float(raw.get("totalOtherIncomeExpenseNet")),

        # Bottom of P&L
        "pretax_income":                                        _float(raw.get("incomeBeforeTax")),
        "income_tax":                                           _float(raw.get("incomeTaxExpense")),
        "net_income_continuing":                                _float(raw.get("netIncomeFromContinuingOps")),
        "net_income_discontinued":                              _float(raw.get("discontinuedOperations")),
        "income_allocated_to_minority_interest":                _float(raw.get("minorityInterest")),
        "other_income_statement_items":                         _float(raw.get("effectOfAccountingCharges")),
        "net_income":                                           _float(raw.get("netIncome")),
        "preferred_dividends":                                  _float(raw.get("preferredStockAndOtherAdjustments")),
        "net_income_available_to_shareholders":                 _float(raw.get("netIncomeApplicableToCommonShares")),

        # EPS / shares — not in EODHD Financials section
        "eps_basic":                                            None,
        "eps_diluted":                                          None,
        "shares_basic":                                         None,
        "shares_diluted":                                       None,
        "shares_eop":                                           None,
        "shares_eop_change":                                    None,

        # Insurance-specific — not provided by EODHD for standard companies
        "premiums_earned":                                      None,
        "net_investment_income":                                None,
        "fees_and_other_income":                                None,
        "net_policyholder_claims_expense":                      None,
        "policy_acquisition_expense":                           None,
        "interest_expense_insurance":                           None,
        "total_interest_income":                                None,
        "total_interest_expense":                               None,
        # net_interest_income: the banking NII field (same source as net_interest_income_normal)
        "net_interest_income":                                  _float(raw.get("netInterestIncome")),
        "total_noninterest_revenue":                            None,
        "credit_losses_provision":                              None,
        "net_interest_income_after_credit_losses_provision":    None,
        "total_noninterest_expense":                            None,
        "da_income_statement_supplemental":                     _float(raw.get("depreciationAndAmortization")),
    }


# ── Balance Sheet ──────────────────────────────────────────────────────────────

def transform_balance_sheet(raw: dict, qfs_symbol: str) -> dict:
    return {
        "qfs_symbol_id":                        qfs_symbol,
        "period_end_date":                      raw["date"],

        # Current assets
        "cash_and_equiv":                       _float(raw.get("cashAndEquivalents")),
        "st_investments":                       _float(raw.get("shortTermInvestments")),
        "receivables":                          _float(raw.get("netReceivables")),
        "inventories":                          _float(raw.get("inventory")),
        "other_current_assets":                 _float(raw.get("otherCurrentAssets")),
        "total_current_assets":                 _float(raw.get("totalCurrentAssets")),

        # Long-term assets
        "equity_and_other_investments":         _float(raw.get("longTermInvestments")),
        "ppe_gross":                            _float(raw.get("propertyPlantAndEquipmentGross")),
        "accumulated_depreciation":             _float(raw.get("accumulatedDepreciation")),
        "ppe_net":                              _float(raw.get("propertyPlantAndEquipmentNet")),
        "intangible_assets":                    _float(raw.get("intangibleAssets")),
        "goodwill":                             _float(raw.get("goodWill")),         # capital W — intentional
        "other_lt_assets":                      _float(raw.get("otherAssets")),
        "total_assets":                         _float(raw.get("totalAssets")),

        # Current liabilities
        "accounts_payable":                     _float(raw.get("accountsPayable")),
        "tax_payable":                          None,
        "current_accrued_liabilities":          None,
        "st_debt":                              _float(raw.get("shortTermDebt")),
        "current_deferred_revenue":             _float(raw.get("currentDeferredRevenue")),
        "current_deferred_tax_liability":       None,
        "current_capital_leases":               None,
        "other_current_liabilities":            _float(raw.get("otherCurrentLiab")),
        "total_current_liabilities":            _float(raw.get("totalCurrentLiabilities")),

        # Long-term liabilities
        "lt_debt":                              _float(raw.get("longTermDebt")),
        "noncurrent_capital_leases":            _float(raw.get("capitalLeaseObligations")),
        "pension_liabilities":                  None,
        "noncurrent_deferred_revenue":          _float(raw.get("deferredLongTermLiab")),
        "other_lt_liabilities":                 _float(raw.get("nonCurrentLiabilitiesOther")),
        "total_liabilities":                    _float(raw.get("totalLiab")),

        # Equity
        "common_stock":                         _float(raw.get("commonStock")),
        "preferred_stock":                      _float(raw.get("preferredStockRedeemable")),
        "retained_earnings":                    _float(raw.get("retainedEarnings")),
        "aoci":                                 _float(raw.get("accumulatedOtherComprehensiveIncome")),
        "apic":                                 _float(raw.get("additionalPaidInCapital")),
        "treasury_stock":                       _float(raw.get("treasuryStock")),
        "other_equity":                         _float(raw.get("otherStockholderEquity")),
        "minority_interest_liability":          _float(raw.get("noncontrollingInterestInConsolidatedEntity")),
        "total_equity":                         _float(raw.get("totalStockholderEquity")),
        "total_liabilities_and_equity":         _float(raw.get("liabilitiesAndStockholdersEquity")),
        "total_investments":                    _float(raw.get("longTermInvestments")),

        # Insurance / banking specific — not provided
        "deferred_policy_acquisition_cost":     None,
        "unearned_premiums":                    None,
        "future_policy_benefits":               None,
        "loans_gross":                          None,
        "allowance_for_loan_losses":            None,
        "unearned_income":                      None,
        "loans_net":                            None,
        "deposits_liability":                   None,

        # Computed by management command — not populated here
        "operating_assets":                     None,
        "operating_liabilities":                None,
        "net_operating_assets":                 None,
    }


# ── Cash Flow Statement ────────────────────────────────────────────────────────

def transform_cash_flow(raw: dict, qfs_symbol: str) -> dict:
    return {
        "qfs_symbol_id":                    qfs_symbol,
        "period_end_date":                  raw["date"],

        # CFO
        "cfo_net_income":                   _float(raw.get("netIncome")),
        "cfo_da":                           _float(raw.get("depreciation")),
        "cfo_receivables":                  _float(raw.get("changeToAccountReceivables")),
        "cfo_inventory":                    _float(raw.get("changeToInventory")),
        "cfo_prepaid_expenses":             None,
        "cfo_other_working_capital":        _float(raw.get("changeToOperatingActivities")),
        "cfo_change_in_working_capital":    _float(raw.get("changeInWorkingCapital")),
        "cfo_deferred_tax":                 None,
        "cfo_stock_comp":                   _float(raw.get("stockBasedCompensation")),
        "cfo_other_noncash_items":          _float(raw.get("otherNonCashItems")),
        "cf_cfo":                           _float(raw.get("totalCashFromOperatingActivities")),

        # CFI — provider does not split PP&E purchases vs sales
        "cfi_ppe_purchases":                _float(raw.get("capitalExpenditures")),
        "cfi_ppe_sales":                    None,
        "cfi_ppe_net":                      _float(raw.get("capitalExpenditures")),
        "cfi_acquisitions":                 None,
        "cfi_divestitures":                 None,
        "cfi_acquisitions_net":             None,
        "cfi_investment_purchases":         None,
        "cfi_investment_sales":             None,
        "cfi_investment_net":               _float(raw.get("investments")),
        "cfi_intangibles_net":              None,
        "cfi_other":                        _float(raw.get("otherCashflowsFromInvestingActivities")),
        "cf_cfi":                           _float(raw.get("totalCashflowsFromInvestingActivities")),

        # CFF — provider gives net figures only, not gross issued/repaid splits
        "cff_common_stock_issued":          None,
        "cff_common_stock_repurchased":     None,
        "cff_common_stock_net":             _float(raw.get("salePurchaseOfStock")),
        "cff_pfd_issued":                   None,
        "cff_pfd_repurchased":              None,
        "cff_pfd_net":                      None,
        "cff_debt_issued":                  None,
        "cff_debt_repaid":                  None,
        "cff_debt_net":                     _float(raw.get("netBorrowings")),
        "cff_dividend_paid":                _float(raw.get("dividendsPaid")),
        "cff_other":                        _float(raw.get("otherCashflowsFromFinancingActivities")),
        "cf_cff":                           _float(raw.get("totalCashFromFinancingActivities")),

        "cf_forex":                         _float(raw.get("exchangeRateChanges")),
        "cf_net_change_in_cash":            _float(raw.get("changeInCash")),
    }
