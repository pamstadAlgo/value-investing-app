from .base import BaseReportAgent
from .context_bundle import ContextBundle
from .schemas import OwnershipOutput


class OwnershipAgent(BaseReportAgent):
    key           = "ownership"
    prompt_label  = "OWNERSHIP & INSIDER DATA"
    output_schema = OwnershipOutput
    system_prompt = """
You are an expert in analysing corporate ownership structure and insider behaviour.

Assess:
- Insider buying/selling: open-market buying at current prices = strong alignment signal;
  heavy selling beyond diversification = warning
- Skin in the game: do insiders hold meaningful stakes relative to compensation?
- Institutional quality: are major holders long-term value investors or momentum/index funds?
- Ownership concentration: aligned control vs. entrenchment risk
- Any blockholder activism or pressure for strategic change

If insider or ownership data is unavailable, say so explicitly rather than speculating.
""".strip()

    def build_user_message(self, bundle: ContextBundle) -> str:
        return f"""Assess ownership and insider activity for {bundle.company_name} ({bundle.qfs_symbol}).

## RESEARCH DOCUMENTS
{bundle.summarized_docs(types=["proxy_statement"])}

## INSIDER TRANSACTION DATA
{bundle.insider_data or "Not yet available."}

## SHAREHOLDER STRUCTURE
{bundle.shareholder_data or "Not yet available."}

Provide a structured ownership assessment.
"""
