import json
import logging
import time

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
        prompt = f"Extract structured information from the following document:\n\n{md_content}"
        return self.run_agent(prompt, SYSTEM_PROMPT, DocumentExtraction)

    _MAX_RETRIES = 3

    @staticmethod
    def _is_transient(exc: Exception) -> bool:
        """True for temporary server errors (503/UNAVAILABLE) that are worth retrying."""
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
