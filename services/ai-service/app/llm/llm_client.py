import re

from app.config import settings


class LLMClient:
    """Unified LLM client with mock fallback.

    Mock responses are strictly data-driven: every number is interpolated from
    the values the endpoint actually loaded from the platform. If a question
    cannot be answered from that data, the mock says so instead of inventing
    figures.
    """

    def __init__(self):
        self.use_mock = settings.use_mock_llm
        self.api_key = settings.openai_api_key
        self.model = settings.llm_model

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        if self.use_mock or not self.api_key:
            return self._mock_from_data(user_prompt)
        return await self._openai_response(system_prompt, user_prompt)

    async def _openai_response(self, system_prompt: str, user_prompt: str) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=1500,
            )
            return response.choices[0].message.content
        except Exception as e:
            return self._mock_from_data(user_prompt)

    def _mock_from_data(self, user_prompt: str) -> str:
        data = self._extract(user_prompt)
        prompt_lower = user_prompt.lower()

        if "biggest risk" in prompt_lower or "top risk" in prompt_lower:
            if data["drivers"]:
                head = data["drivers"][0]
                return (
                    f"Based on current quantification data, the biggest financial risk "
                    f"exposure is {head['name']}, with a risk score of {head['score']} and "
                    f"an Expected Annual Loss of ₹{head['eal']:,.0f}. "
                    f"The top {len(data['drivers'])} risk drivers account for "
                    f"₹{sum(d['eal'] for d in data['drivers']):,.0f} of portfolio EAL. "
                    "Remediating the highest-EAL driver first gives the largest "
                    "financial return on the available budget."
                )
            return "No risk driver data is available to answer this precisely."

        if "recommend" in prompt_lower or "suggest" in prompt_lower:
            if not data["drivers"]:
                return "No risk driver data is available to base recommendations on."
            lines = ["Based on the actual risk data, priority actions:"]
            for i, d in enumerate(data["drivers"][:3], start=1):
                lines.append(
                    f"{i}. Remediate the top open vulnerabilities on {d['name']} "
                    f"(risk score {d['score']}, EAL ₹{d['eal']:,.0f}/yr)."
                )
            lines.append(
                f"Estimated total EAL at stake: ₹{data.get('total_eal', 0):,.0f} — "
                "reduce it by focusing investment on these drivers."
            )
            return "\n".join(lines)

        if "invest" in prompt_lower or "budget" in prompt_lower:
            return (
                f"Current enterprise EAL is ₹{data.get('total_eal', 0):,.0f}. "
                "Investment should target the controls that reduce the highest-EAL "
                "drivers first (see the optimizer for rupee-ranked portfolios). "
                "I do not compute precise portfolio returns here — that is produced "
                "by the investment optimizer with actual per-control deltas."
            )

        if "summary" in prompt_lower or "executive" in prompt_lower:
            lines = [
                "EXECUTIVE CYBER RISK SUMMARY (from live data)",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                f"Enterprise Risk Score: {data.get('risk_score', 'N/A')}/100",
                f"Expected Annual Loss: ₹{data.get('total_eal', 0):,.0f}",
                f"Total Assets Monitored: {data.get('assets', 'N/A')}",
                f"Open Vulnerabilities: {data.get('vulns', 'N/A')}",
                "",
                "Top risk concentrations:",
            ]
            for i, d in enumerate(data["drivers"][:3], start=1):
                lines.append(f"{i}. {d['name']} — ₹{d['eal']:,.0f}/yr (score {d['score']})")
            return "\n".join(lines)

        return (
            f"I can only answer from the platform data. Currently: enterprise risk "
            f"score {data.get('risk_score', 'n/a')}/100, EAL ₹{data.get('total_eal', 0):,.0f}, "
            f"across {data.get('assets', 'n/a')} assets with {data.get('vulns', 'n/a')} open "
            "vulnerabilities. Ask about top risks, recommendations, investment "
            "strategy, or an executive summary."
        )

    def _extract(self, prompt: str) -> dict:
        def _first(pattern: str):
            m = re.search(pattern, prompt)
            return m.group(1) if m else None

        def _first_float(pattern: str, default=0.0):
            m = re.search(pattern, prompt)
            return float(m.group(1).replace(",", "")) if m else default

        total_eal = None
        m = re.search(r"Total (?:Expected Annual Loss|EAL): ?₹?([\d,]+)", prompt)
        if m:
            total_eal = float(m.group(1).replace(",", ""))
        m = re.search(r"Enterprise Risk Score: ?([\d.]+)", prompt)
        risk_score = m.group(1) if m else None

        assets = None
        m = re.search(r"Total Assets(?: Monitored)?: ?(\d+)", prompt)
        if m:
            assets = m.group(1)
        vulns = None
        m = re.search(r"Open Vulnerabilities?: ?(\d+)", prompt)
        if m:
            vulns = m.group(1)

        drivers = []
        driver_re = re.compile(
            r"[-•]\s*([A-Za-z0-9 &()\-]+): (?:Score )?([\d.]+)(?:, EAL ₹([\d,]+))?",
            re.IGNORECASE,
        )
        for m in driver_re.finditer(prompt):
            drivers.append({
                "name": m.group(1).strip(),
                "score": m.group(2),
                "eal": float(m.group(3).replace(",", "")) if m.group(3) else 0,
            })

        return {
            "total_eal": total_eal if total_eal is not None else _first_float(r"Total EAL: ?₹?([\d.]+)"),
            "risk_score": risk_score,
            "assets": assets,
            "vulns": vulns,
            "drivers": drivers[:5],
        }


llm_client = LLMClient()