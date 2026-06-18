from abc import ABC, abstractmethod
from typing import ClassVar
from pydantic import BaseModel
from .context_bundle import ContextBundle


class BaseReportAgent(ABC):
    """
    Base class for all analysis agents in the report pipeline.

    Each agent is responsible for one analytical lens (e.g. earnings quality,
    valuation, competitive position). It receives a shared ContextBundle,
    selects the relevant slice of data, and calls the LLM with a specialised
    system prompt and output schema.

    To add a new agent:
      1. Subclass BaseReportAgent in a new file
      2. Define the four class attributes below
      3. Implement build_user_message()
      4. Register the class in report_agents/__init__.py AGENT_REGISTRY
    """

    key: ClassVar[str]
    """
    Unique identifier for this agent, e.g. "earnings_quality".
    Used as the dict key in agent_outputs and referenced in the assembly prompt.
    """

    prompt_label: ClassVar[str]
    """
    Human-readable label shown in the assembly prompt, e.g. "EARNINGS QUALITY FINDINGS".
    The assembly agent uses this as a section header when presenting findings to the LLM.
    """

    system_prompt: ClassVar[str]
    """
    The LLM system instruction for this agent. Should encode the analytical framework
    and the specific lens this agent applies (e.g. Doron Nissim for earnings quality,
    Howard Schilit for financial risk). Kept at class level so it is defined once
    alongside the agent, not scattered across the codebase.
    """

    output_schema: ClassVar[type[BaseModel]]
    """
    Pydantic model that defines the structured output this agent produces.
    Passed to the LLM provider for constrained decoding. Defined in schemas.py.
    """

    @abstractmethod
    def build_user_message(self, bundle: ContextBundle) -> str:
        """
        Construct the user-turn message for this agent's LLM call.

        Each agent selects the relevant slice of data from the bundle and formats
        it into a prompt. For example:
          - EarningsQualityAgent pulls bundle.raw_docs(["annual_report"]) because
            it needs full financial statement detail.
          - GuidanceAgent pulls bundle.summarized_docs(["earnings_call"]) because
            it only needs tone and key statements, not raw numbers.

        This is the main customisation point per agent.
        """

    def run(self, bundle: ContextBundle, provider) -> dict:
        """
        Execute this agent: build the prompt, call the LLM, return structured output.

        Calls build_user_message() to assemble the input, then delegates to
        provider.run_agent() which handles the actual LLM call, constrained decoding,
        and fallback logic. Returns a dict matching this agent's output_schema.
        """
        return provider.run_agent(
            user_message=self.build_user_message(bundle),
            system_prompt=self.system_prompt,
            schema=self.output_schema,
        )
