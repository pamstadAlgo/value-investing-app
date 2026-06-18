from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Blueprint for LLM providers that produce structured output from document text."""

    @abstractmethod
    def extract(self, md_content: str) -> dict:
        """Extract structured fields from a single document's markdown."""

    @abstractmethod
    def run_agent(self, user_message: str, system_prompt: str, schema: type) -> dict:
        """
        Generic structured LLM call used by all report agents.
        Takes a fully assembled user message, a system prompt, and a Pydantic
        schema for constrained decoding. Returns a dict matching that schema.
        """
