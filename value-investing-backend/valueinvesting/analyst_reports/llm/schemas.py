from pydantic import BaseModel, Field
from typing import Optional


class DocumentExtraction(BaseModel):
    document_type: str = Field(
        description=(
            "Type of document. Examples: 'analyst_report', 'earnings_call', "
            "'annual_report', 'news_article', 'investor_presentation', 'filing'. "
            "Infer from content if not stated explicitly."
        )
    )
    company_name: str = Field(
        description="Full legal name of the company the document is about."
    )
    summary: str = Field(
        description="2-3 sentence neutral summary of the document's main message."
    )
    key_points: list[str] = Field(
        description=(
            "The most important takeaways from the document as concise bullet points. "
            "Focus on facts and statements relevant to a fundamental investor."
        )
    )
    financials_mentioned: list[str] = Field(
        description=(
            "Specific financial figures, metrics, or ratios referenced in the document. "
            "Include the metric name and value exactly as stated, e.g. 'Revenue: $4.2B', 'EBIT margin: 18%'."
        )
    )
    sentiment: str = Field(
        description=(
            "Overall tone of the document toward the company's prospects. "
            "One of: 'bullish', 'bearish', 'neutral'."
        )
    )
    recommendation: Optional[str] = Field(
        default=None,
        description=(
            "Explicit investment recommendation if present, e.g. 'Buy', 'Hold', 'Sell', 'Outperform'. "
            "Null if the document does not contain one."
        )
    )
    price_target: Optional[float] = Field(
        default=None,
        description=(
            "Analyst price target in the document's stated currency, as a plain number. "
            "Null if not present."
        )
    )
    date: Optional[str] = Field(
        default=None,
        description="Publication or report date as it appears in the document. Null if not found."
    )
    author: Optional[str] = Field(
        default=None,
        description="Author or analyst name if stated. Null if not found."
    )
