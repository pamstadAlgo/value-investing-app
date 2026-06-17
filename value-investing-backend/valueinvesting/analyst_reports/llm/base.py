from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Blueprint for LLM providers that produce structured output from document text."""

    @abstractmethod
    def extract(self, md_content: str) -> dict:
        """
        Extract structured fields from the markdown content of a document.

        Returns a dict conforming to DocumentExtraction.
        """
