import json
import logging
import time

from django.conf import settings
from google import genai
from google.genai import types

from .base import LLMProvider
from .schemas import (
    DocumentClassification,
    DocumentType,
    AnnualReportExtraction,
    EarningsCallExtraction,
    AnalystReportExtraction,
    GenericExtraction,
)

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """
You are a seasoned value investor with deep expertise in fundamental analysis, modeled on the principles
of Benjamin Graham and Warren Buffett. Your task is to read financial documents and extract structured
information that will feed into a comprehensive analyst report.

When analysing documents, prioritise:
- Long-term business quality over short-term price movements
- Earnings power, return on capital, and balance sheet strength
- Management integrity and capital allocation track record
- Margin of safety relative to intrinsic value
- Durable competitive advantages (moats)

Be precise and factual. Do not fabricate figures. If a field cannot be determined from the document,
leave it null rather than guessing.
""".strip()

_SCHEMA_MAP = {
    DocumentType.ANNUAL_REPORT:    AnnualReportExtraction,
    DocumentType.QUARTERLY_REPORT: AnnualReportExtraction,
    DocumentType.EARNINGS_CALL:    EarningsCallExtraction,
    DocumentType.ANALYST_REPORT:   AnalystReportExtraction,
}


def _schema_for(document_type: str) -> type:
    try:
        dt = DocumentType(document_type)
    except ValueError:
        return GenericExtraction
    return _SCHEMA_MAP.get(dt, GenericExtraction)


class GeminiStructuredOutput(LLMProvider):

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    _MAX_RETRIES = 3

    @staticmethod
    def _is_transient(exc: Exception) -> bool:
        return "503" in str(exc) or "UNAVAILABLE" in str(exc)

    def _generate(self, user_message: str, system_prompt: str, schema: type):
        """Single Gemini call with schema-rejection fallback."""
        try:
            return self.client.models.generate_content(
                model=self.model,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
        except Exception as e:
            if "too many states" in str(e).lower() or "INVALID_ARGUMENT" in str(e):
                logger.warning("Gemini rejected schema — falling back to prompt-embedded JSON")
                schema_json = json.dumps(schema.model_json_schema(), indent=2)
                return self.client.models.generate_content(
                    model=self.model,
                    contents=(
                        f"{user_message}\n\n"
                        f"Respond with a single JSON object matching this schema:\n{schema_json}"
                    ),
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                    ),
                )
            raise

    def run_agent(self, user_message: str, system_prompt: str, schema: type) -> dict:
        """
        Generic structured Gemini call used by all report agents.

        Retries up to _MAX_RETRIES times on transient 503 errors with
        exponential backoff (10 s, 20 s, 40 s) before giving up.
        """
        for attempt in range(self._MAX_RETRIES + 1):
            try:
                response = self._generate(user_message, system_prompt, schema)
                break
            except Exception as e:
                if self._is_transient(e) and attempt < self._MAX_RETRIES:
                    delay = 10 * (2 ** attempt)
                    logger.warning("Gemini 503 — retrying in %ss (attempt %s/%s)", delay, attempt + 1, self._MAX_RETRIES)
                    time.sleep(delay)
                else:
                    raise

        if not response.text:
            raise ValueError("Empty response from Gemini")

        return schema.model_validate_json(response.text).model_dump()

    def _classify(self, md_content: str) -> DocumentClassification:
        """Cheap first call: detect document_type and company_name."""
        prompt = (
            "Read the following document and identify its type and the company it covers.\n\n"
            f"{md_content[:8000]}"  # first 8K chars is enough for classification
        )
        result = self.run_agent(prompt, EXTRACTION_SYSTEM_PROMPT, DocumentClassification)
        return DocumentClassification(**result)

    def extract(self, md_content: str, document_type: str | None = None) -> dict:
        """
        Extract structured information from a document.

        If document_type is provided (user-set pre-upload), skip classification
        and use the per-type schema directly (1 LLM call). Otherwise classify
        first, then extract with the per-type schema (2 LLM calls).
        """
        if document_type:
            detected_type = document_type
            company_name = None
        else:
            classification = self._classify(md_content)
            detected_type = classification.document_type.value
            company_name = classification.company_name

        schema = _schema_for(detected_type)
        prompt = f"Extract structured information from the following document:\n\n{md_content}"
        result = self.run_agent(prompt, EXTRACTION_SYSTEM_PROMPT, schema)

        result["document_type"] = detected_type
        if company_name and "company_name" not in result:
            result["company_name"] = company_name

        return result
