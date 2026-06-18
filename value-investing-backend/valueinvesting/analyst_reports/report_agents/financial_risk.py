from .base import BaseReportAgent
from .context_bundle import ContextBundle
from .schemas import FinancialRiskOutput


class FinancialRiskAgent(BaseReportAgent):
    key           = "financial_risk"
    prompt_label  = "RED FLAGS FINDINGS"
    output_schema = FinancialRiskOutput
    system_prompt = """
You are an expert in detecting financial reporting manipulation, trained in Howard Schilit's
"Financial Shenanigans".

Look for:
- Revenue manipulation: channel stuffing, round-tripping, premature recognition
- Expense manipulation: aggressive capitalisation, cookie jar reserves
- Balance sheet inflation: off-balance-sheet liabilities, goodwill impairment avoidance
- Cash flow shenanigans: misclassification between operating/investing/financing
- Warning signals: auditor changes, restatements, related-party transactions,
  non-GAAP metrics that diverge sharply from GAAP

If you find no red flags, say so directly. Do not manufacture concerns.
""".strip()

    def build_user_message(self, bundle: ContextBundle) -> str:
        return f"""Identify financial risk and red flags for {bundle.company_name} ({bundle.qfs_symbol}).

## RESEARCH DOCUMENTS
{bundle.raw_docs(types=["annual_report", "quarterly_report"])}

## FINANCIAL METRICS
{bundle.financial_metrics or "Not yet available — base your analysis on the documents."}

Provide a structured financial risk assessment.
"""
