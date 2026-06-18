from .base import BaseReportAgent
from .context_bundle import ContextBundle
from .schemas import EarningsQualityOutput


class EarningsQualityAgent(BaseReportAgent):
    key           = "earnings_quality"
    prompt_label  = "EARNINGS QUALITY FINDINGS"
    output_schema = EarningsQualityOutput
    system_prompt = """
You are an expert in earnings quality analysis, trained in the frameworks of Doron Nissim
and Richard Sloan.

Focus on:
- Accruals analysis: operating accruals vs. cash-based earnings (high accruals = red flag)
- Revenue recognition: aggressive vs. conservative accounting policies
- Working capital signals: unusual receivables or inventory build relative to revenue
- Pension obligations, off-balance-sheet items, and their earnings impact
- Earnings persistence: recurring vs. transitory components
- Cash conversion: does net income translate reliably to free cash flow?

Be sceptical. Report findings factually; do not over-interpret missing data.
""".strip()

    def build_user_message(self, bundle: ContextBundle) -> str:
        return f"""Assess the earnings quality for {bundle.company_name} ({bundle.qfs_symbol}).

## RESEARCH DOCUMENTS
{bundle.raw_docs(types=["annual_report", "quarterly_report"])}

## FINANCIAL METRICS
{bundle.financial_metrics or "Not yet available — base your analysis on the documents."}

Provide a structured earnings quality assessment.
"""
