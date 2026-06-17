import json
import logging

from django.conf import settings
from google import genai
from google.genai import types

from .base import LLMProvider
from .schemas import DocumentExtraction

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
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


class GeminiStructuredOutput(LLMProvider):

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    def extract(self, md_content: str) -> dict:
        return self._gemini_call(md_content)

    def _gemini_call(self, doc_text: str) -> dict:
        """
        Sync Gemini call.

        Tries constrained decoding first (response_schema). If Gemini rejects
        the schema as too complex, falls back to free-form JSON with the schema
        embedded in the prompt.
        """
        prompt = f"Extract structured information from the following document:\n\n{doc_text}"

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=DocumentExtraction,
                ),
            )
        except Exception as e:
            if "too many states" in str(e).lower() or "INVALID_ARGUMENT" in str(e):
                logger.warning("Gemini rejected schema — falling back to prompt-embedded JSON")
                schema_json = json.dumps(DocumentExtraction.model_json_schema(), indent=2)
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=(
                        f"{prompt}\n\n"
                        f"Respond with a single JSON object matching this schema:\n{schema_json}"
                    ),
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json",
                    ),
                )
            else:
                raise

        if not response.text:
            raise ValueError("Empty response from Gemini")

        return DocumentExtraction.model_validate_json(response.text).model_dump()
