from __future__ import annotations

import json
from dataclasses import dataclass, field


@dataclass
class DocumentContext:
    file_name: str
    document_type: str   # matches UserUpload.DocumentType values
    raw_markdown: str    # from ocr_s3_key
    llm_summary: dict    # from llm_s3_key


@dataclass
class ContextBundle:
    qfs_symbol: str
    company_name: str
    documents: list[DocumentContext] = field(default_factory=list)
    financial_metrics: str = ""   # TODO: from quickfs_dj
    valuation_data: str = ""      # TODO: from valuation_history
    insider_data: str = ""        # TODO: from quickfs_dj
    shareholder_data: str = ""    # TODO: from quickfs_dj

    def raw_docs(self, types: list[str] | None = None) -> str:
        docs = self.documents if types is None else [
            d for d in self.documents if d.document_type in types
        ]
        if not docs:
            return "No relevant documents available."
        blocks = [
            f"### [{i + 1}] {d.file_name} ({d.document_type})\n\n{d.raw_markdown}"
            for i, d in enumerate(docs)
        ]
        return "\n\n---\n\n".join(blocks)

    def summarized_docs(self, types: list[str] | None = None) -> str:
        docs = self.documents if types is None else [
            d for d in self.documents if d.document_type in types
        ]
        if not docs:
            return "No relevant documents available."
        return "\n\n".join(
            f"### [{i + 1}] {d.file_name}\n{json.dumps(d.llm_summary, indent=2)}"
            for i, d in enumerate(docs)
        )
