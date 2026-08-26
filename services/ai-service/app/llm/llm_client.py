from app.config import settings


class LLMClient:
    """Unified LLM client with mock fallback."""

    def __init__(self):
        self.use_mock = settings.use_mock_llm
        self.api_key = settings.openai_api_key
        self.model = settings.llm_model

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        if self.use_mock or not self.api_key:
            return self._mock_response(user_prompt)
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
            return self._mock_response(user_prompt)

    def _mock_response(self, user_prompt: str) -> str:
        prompt_lower = user_prompt.lower()

        if "biggest risk" in prompt_lower or "top risk" in prompt_lower:
            return (
                "Based on current risk quantification data, your organization's "
                "biggest financial risk exposure comes from payment infrastructure "
                "assets. The payment gateway server (PAY-SRV-001) has an Expected "
                "Annual Loss of approximately ₹2.4 Crore due to a combination of "
                "critical vulnerabilities (CVSS 9.8), internet exposure, and "
                "RESTRICTED data sensitivity.\n\n"
                "Key contributing factors:\n"
                "1. SQL Injection vulnerability (CVE-2026-1001) — CVSS 9.8\n"
                "2. Internet-facing exposure with public IP\n"
                "3. RESTRICTED data classification (PCI-DSS scope)\n"
                "4. Incomplete MFA coverage on payment systems\n\n"
                "Recommended immediate action: Remediate CVE-2026-1001 and deploy "
                "WAF rules as interim mitigation. This alone could reduce the "
                "payment infrastructure EAL by approximately 40%."
            )

        elif "recommend" in prompt_lower or "suggest" in prompt_lower:
            return (
                "Based on current risk posture analysis, I recommend the following "
                "priority actions:\n\n"
                "PRIORITY 1 — Immediate (This Week):\n"
                "• Remediate CVE-2026-1001 (SQL Injection on payment server)\n"
                "• Enable MFA on Identity Provider admin console\n"
                "• Rotate exposed AWS credentials from CVE-2026-1002\n\n"
                "PRIORITY 2 — Short-term (This Month):\n"
                "• Deploy WAF in front of customer web portal\n"
                "• Apply path traversal fix for file upload handler\n"
                "• Disable TLS 1.0/1.1 on VPN concentrator\n\n"
                "PRIORITY 3 — Medium-term (This Quarter):\n"
                "• Implement network segmentation for payment infrastructure\n"
                "• Enable backup encryption and immutability\n"
                "• Deploy EDR on all production servers\n\n"
                "Estimated impact of PRIORITY 1 actions: ₹1.8 Crore EAL reduction\n"
                "Total estimated impact of all actions: ₹4.2 Crore EAL reduction"
            )

        elif "invest" in prompt_lower or "budget" in prompt_lower:
            return (
                "Investment Optimization Analysis:\n\n"
                "With a ₹1 Crore budget, the optimal allocation would be:\n"
                "1. Critical Patch Management — ₹15 Lakh (highest ROI)\n"
                "2. MFA Implementation — ₹20 Lakh\n"
                "3. Network Segmentation — ₹30 Lakh\n"
                "4. Backup Improvement — ₹15 Lakh\n"
                "5. EDR Enhancement — ₹15 Lakh\n\n"
                "Total: ₹95 Lakh | Remaining: ₹5 Lakh\n\n"
                "Expected Result:\n"
                "• Current EAL: ₹8.5 Crore\n"
                "• Post-investment EAL: ₹4.3 Crore\n"
                "• Risk Reduction: ₹4.2 Crore (49.4%)\n"
                "• Portfolio ROSI: 352% over 3 years\n\n"
                "This allocation prioritizes controls that affect the most assets "
                "and have the highest risk reduction per rupee invested."
            )

        elif "summary" in prompt_lower or "executive" in prompt_lower:
            return (
                "EXECUTIVE CYBER RISK SUMMARY\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                "Current Risk Posture:\n"
                "• Enterprise Risk Score: 72/100 (HIGH)\n"
                "• Expected Annual Loss: ₹8.5 Crore\n"
                "• Total Assets Monitored: 12\n"
                "• Open Vulnerabilities: 87 (12 Critical)\n"
                "• Control Coverage: 40%\n\n"
                "Top 3 Risk Concentrations:\n"
                "1. Payment Infrastructure — ₹2.4 Cr exposure\n"
                "2. Customer Database — ₹1.8 Cr exposure\n"
                "3. Cloud Management — ₹0.9 Cr exposure\n\n"
                "Recommended Investment: ₹95 Lakh\n"
                "Expected Risk Reduction: ₹4.2 Crore\n"
                "Portfolio ROSI: 352%\n\n"
                "Critical Action Required:\n"
                "• 12 critical vulnerabilities need immediate remediation\n"
                "• MFA is disabled on IdP admin console\n"
                "• Backup systems lack encryption"
            )

        else:
            return (
                f"I understand your question: '{user_prompt[:100]}...'\n\n"
                "Based on the current risk data, here is my analysis:\n\n"
                "• Your organization currently has an Expected Annual Loss of ₹8.5 Crore\n"
                "• The highest-risk assets are payment infrastructure and customer database\n"
                "• 40% control coverage is below the recommended 70%\n\n"
                "For more specific guidance, please ask about:\n"
                "- Risk analysis (\"What is our biggest risk?\")\n"
                "- Investment optimization (\"How should we invest our budget?\")\n"
                "- Executive summary (\"Give me an executive summary\")\n"
                "- Recommendations (\"What should we fix first?\")"
            )


llm_client = LLMClient()
