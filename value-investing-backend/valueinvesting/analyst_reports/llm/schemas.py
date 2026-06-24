from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class DocumentType(str, Enum):
    ANNUAL_REPORT         = "annual_report"
    QUARTERLY_REPORT      = "quarterly_report"
    EARNINGS_CALL         = "earnings_call"
    INVESTOR_PRESENTATION = "investor_presentation"
    ANALYST_REPORT        = "analyst_report"
    NEWS_ARTICLE          = "news_article"
    OTHER                 = "other"


class DocumentClassification(BaseModel):
    """Cheap first-pass call: detect document type and company name before running the full extraction."""
    document_type: DocumentType = Field(
        description="Type of document inferred from content."
    )
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )


# ─── Annual / Quarterly report ────────────────────────────────────────────────

class AnnualReportExtraction(BaseModel):
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )
    summary: str = Field(
        description="3-4 sentence neutral summary of the document's main message."
    )
    segment_overview: list[str] = Field(
        description=(
            "Key business segments or divisions with a brief description of each. "
            "e.g. 'Life Sciences ($2.7B revenue): instruments and reagents for biotech customers'."
        )
    )
    key_qualitative_points: list[str] = Field(
        description=(
            "The most important qualitative observations relevant to a fundamental investor: "
            "strategic changes, management emphasis, competitive dynamics, capital allocation signals. "
            "Focus on facts not easily captured by financial metrics alone."
        )
    )
    risks_highlighted: list[str] = Field(
        description=(
            "Key risks the company flags, in order of materiality. "
            "Prefer specific and company-relevant risks over generic boilerplate."
        )
    )
    sentiment: str = Field(
        description="Overall management tone toward the company's prospects: 'bullish', 'cautious', or 'neutral'."
    )
    date: Optional[str] = Field(
        default=None,
        description="Fiscal period or filing date as stated in the document."
    )


# ─── Earnings call ────────────────────────────────────────────────────────────

class GuidanceStatement(BaseModel):
    metric: str = Field(description="The metric being guided, e.g. 'Revenue', 'EPS', 'Gross Margin'.")
    value: str = Field(description="The guided value or range as stated, e.g. '$7.1B-$7.3B', '~18%'.")
    period: str = Field(description="The period this guidance covers, e.g. 'Q1 FY2026', 'Full Year 2026'.")
    qualifier: Optional[str] = Field(
        default=None,
        description="Any material qualifier, e.g. 'excluding tariff impact', 'on a constant currency basis'."
    )


class EarningsCallExtraction(BaseModel):
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )
    summary: str = Field(
        description="2-3 sentence neutral summary of the call's main message."
    )
    management_tone: str = Field(
        description="Overall management tone: 'optimistic', 'cautious', 'balanced', or 'evasive'."
    )
    guidance_statements: list[GuidanceStatement] = Field(
        description="All explicit forward-looking guidance statements made during the call."
    )
    key_quotes: list[str] = Field(
        description=(
            "2-5 verbatim or near-verbatim quotes that best capture management's message "
            "or reveal strategic intent. Prefer specific over generic."
        )
    )
    notable_qa_exchanges: list[str] = Field(
        description=(
            "Notable Q&A exchanges: analyst questions that probed a weakness or surfaced new "
            "information, with management's response summarised in one sentence."
        )
    )
    date: Optional[str] = Field(
        default=None,
        description="Date of the earnings call."
    )


# ─── Analyst report ───────────────────────────────────────────────────────────

class AnalystReportExtraction(BaseModel):
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )
    summary: str = Field(
        description="2-3 sentence neutral summary of the analyst's main argument."
    )
    investment_thesis: str = Field(
        description="1-2 sentence statement of the analyst's core investment thesis."
    )
    key_bull_case: list[str] = Field(
        description="The analyst's main bullish arguments."
    )
    key_bear_case: list[str] = Field(
        description="The analyst's main risks or bearish arguments."
    )
    recommendation: Optional[str] = Field(
        default=None,
        description="Explicit recommendation if present: 'Buy', 'Hold', 'Sell', 'Outperform', etc."
    )
    price_target: Optional[float] = Field(
        default=None,
        description="Analyst price target as a plain number in the document's stated currency."
    )
    sentiment: str = Field(
        description="Overall tone toward the company's prospects: 'bullish', 'bearish', or 'neutral'."
    )
    date: Optional[str] = Field(
        default=None,
        description="Publication date of the report."
    )
    author: Optional[str] = Field(
        default=None,
        description="Analyst or author name if stated."
    )


# ─── Generic fallback ─────────────────────────────────────────────────────────

class GenericExtraction(BaseModel):
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )
    summary: str = Field(
        description="2-3 sentence neutral summary of the document's main message."
    )
    key_points: list[str] = Field(
        description=(
            "The most important takeaways as concise bullet points. "
            "Focus on facts relevant to a fundamental investor."
        )
    )
    sentiment: str = Field(
        description="Overall tone toward the company's prospects: 'bullish', 'bearish', or 'neutral'."
    )
    recommendation: Optional[str] = Field(
        default=None,
        description="Explicit investment recommendation if present. Null otherwise."
    )
    price_target: Optional[float] = Field(
        default=None,
        description="Analyst price target as a plain number. Null if not present."
    )
    date: Optional[str] = Field(
        default=None,
        description="Publication or report date as it appears in the document."
    )
    author: Optional[str] = Field(
        default=None,
        description="Author or analyst name if stated."
    )
