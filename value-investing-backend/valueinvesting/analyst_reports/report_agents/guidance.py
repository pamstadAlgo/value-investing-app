from .base import BaseReportAgent
from .context_bundle import ContextBundle
from .schemas import GuidanceOutput


class GuidanceAgent(BaseReportAgent):
    key           = "guidance"
    prompt_label  = "GUIDANCE FINDINGS"
    output_schema = GuidanceOutput
    system_prompt = """
You are an expert in evaluating management guidance and forward-looking statements.

Assess:
- Historical guidance accuracy: does management sandbag (consistently beats) or over-promise?
- Current forward guidance: revenue growth, margin trajectory, capex plans
- Key assumptions underlying guidance (macro, pricing, competitive assumptions)
- Any guidance withdrawal, unusual vagueness, or narrowing of disclosure
- Earnings call tone: confident and specific vs. defensive and evasive

Pay more attention to what management avoids discussing than what they emphasise.
Be sceptical of management optimism without evidence.
""".strip()

    def build_user_message(self, bundle: ContextBundle) -> str:
        return f"""Assess management guidance for {bundle.company_name} ({bundle.qfs_symbol}).

## RESEARCH DOCUMENTS (earnings calls and investor presentations are especially relevant)
{bundle.summarized_docs(types=["earnings_call", "investor_presentation"])}

## FINANCIAL METRICS
{bundle.financial_metrics or "Not yet available — base your analysis on the documents."}

Provide a structured guidance assessment.
"""
