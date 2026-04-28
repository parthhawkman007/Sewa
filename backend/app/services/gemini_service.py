import google.generativeai as genai
from app.core.config import get_settings

class GeminiService:
    def __init__(self):
        settings = get_settings()
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-3-flash-preview')
        else:
            self.model = None

    async def suggest_category(self, title: str, description: str) -> str:
        """
        Suggest a category based on issue title and description.
        """
        if not self.model:
            # Fallback logic if AI is not configured
            text = f"{title} {description}".lower()
            if "water" in text or "flood" in text: return "Flood Relief"
            if "medicine" in text or "medical" in text: return "Medical Support"
            if "power" in text or "electric" in text: return "Infrastructure"
            if "food" in text or "shelter" in text: return "Relief Supplies"
            return "Community Support"

        prompt = f"""
        Given the following emergency issue, suggest a short category name (max 3 words).
        Title: {title}
        Description: {description}
        Categories to choose from (or suggest similar): Flood Relief, Medical Support, Infrastructure, Relief Supplies, Crowd Management, Community Support.
        Only return the category name.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return "Community Support"

    async def derive_priority(self, urgency: int, emergency: bool) -> str:
        """
        Derive priority based on urgency score and emergency flag.
        """
        if emergency or urgency >= 75:
            return "High"
        if urgency >= 45:
            return "Medium"
        return "Low"

def get_gemini_service() -> GeminiService:
    return GeminiService()
