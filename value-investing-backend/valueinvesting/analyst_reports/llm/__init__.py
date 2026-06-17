from django.conf import settings

from .factory import get_provider


def structure(md_content: str) -> dict:
    provider_name = getattr(settings, "LLM_PROVIDER", "gemini")
    return get_provider(provider_name).extract(md_content)
