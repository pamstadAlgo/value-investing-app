from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Blueprint for LLM providers that produce structured output from document text."""

    @abstractmethod
    def extract(self, md_content: str, document_type: str | None = None) -> dict:
        """
        Extract structured fields from a single document's markdown.

        If document_type is provided, skip the classification call and use the
        per-type schema directly (1 LLM call). Otherwise, classify first then
        extract with the per-type schema (2 LLM calls).
        """

    @abstractmethod
    def run_agent(self, user_message: str, system_prompt: str, schema: type) -> dict:
        """
        Generic structured LLM call used by all report agents.
        Takes a fully assembled user message, a system prompt, and a Pydantic
        schema for constrained decoding. Returns a dict matching that schema.
        """
