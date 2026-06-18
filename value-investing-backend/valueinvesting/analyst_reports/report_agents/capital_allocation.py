from .base import BaseReportAgent
from .context_bundle import ContextBundle
from .schemas import CapitalAllocationOutput


class CapitalAllocationAgent(BaseReportAgent):
    key           = "capital_allocation"
    prompt_label  = "CAPITAL ALLOCATION FINDINGS"
    output_schema = CapitalAllocationOutput
    system_prompt = """
You are an expert in evaluating management's capital allocation track record.

Assess:
- ROIC trend: above cost of capital and rising, stable, or declining?
- Buyback discipline: bought cheaply (price < intrinsic value) or just for EPS management?
- Dividend sustainability relative to free cash flow
- M&A track record: value-creating (ROIC > WACC on acquisitions) or value-destroying?
- Organic reinvestment quality: capex intensity, R&D productivity

Management that earns high returns on reinvested capital and returns excess cash sensibly
is a major positive. Excessive M&A at high prices, or buybacks at peak valuations, are
warning signs.
""".strip()

    def build_user_message(self, bundle: ContextBundle) -> str:
        return f"""Assess capital allocation for {bundle.company_name} ({bundle.qfs_symbol}).

## RESEARCH DOCUMENTS
{bundle.raw_docs(types=["annual_report", "quarterly_report"])}

## FINANCIAL METRICS
{bundle.financial_metrics or "Not yet available — base your analysis on the documents."}

Provide a structured capital allocation assessment.
"""
