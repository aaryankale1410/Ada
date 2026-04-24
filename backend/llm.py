"""
Gemini 2.5 Flash LLM integration for couple's website.
Handles all AI-generated content with carefully crafted prompts.
"""

import os
from google import genai

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash-lite"


async def generate(prompt: str) -> str:
    """Generate text from Gemini 2.5 Flash."""
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"LLM Error: {e}")
        return "Abhi AI thoda busy hai, baad mein try karo! 😅"


# ─── OPEN WHEN PROMPTS ───

async def open_when_sad() -> str:
    return await generate(
        "You are writing a short, heartfelt message for someone's girlfriend who is feeling sad. "
        "Write ONE sentence that is funny, sweet, comforting, and makes her feel loved and safe. "
        "It should feel like a warm hug in words and it should be funny and it should make her giggle. Use simple English. "
        "Don't use quotes. Don't label it. Just the message. Keep it under 20 words. "
        "Be genuine, not cheesy. Make it feel personal, like her boyfriend Aaryan wrote it for Akshada."
    )


async def open_when_miss_me() -> str:
    return await generate(
        "You are writing a short, funny, sweet message for someone's girlfriend who is missing her boyfriend. "
        "Write ONE sentence that is funny, comforting, romantic, and reassuring. "
        "It should make her giggle through the longing. It should be funny. Use simple English. "
        "Don't use quotes. Don't label it. Just the message. Keep it under 20 words. "
        "Make it feel like Aaryan is right there with Akshada even when apart."
    )


async def open_when_cant_sleep() -> str:
    return await generate(
        "You are writing a short, cute and playful bedtime message for someone's girlfriend who can't sleep. "
        "Write ONE sentence that is adorable, slightly funny, and soothing. "
        "It should make her giggle and then feel sleepy. Use simple English. "
        "Don't use quotes. Don't label it. Just the message. Keep it under 20 words. "
        "Make it feel like a cute goodnight text from Aaryan to Akshada."
    )


OPEN_WHEN_HANDLERS = {
    "sad": open_when_sad,
    "miss-me": open_when_miss_me,
    "cant-sleep": open_when_cant_sleep,
}


# ─── PERIOD TRACKER ───

async def period_comment(days_since: int, days_until: int) -> dict:
    prompt = (
        f"You're a cheeky, funny relationship advisor for a couple — Aaryan (boyfriend) and Akshada (girlfriend). "
        f"Akshada's last period was {days_since} days ago. Her next period is expected in {days_until} days. "
        f"Give TWO separate one-sentence responses:\n"
        f"1. FOR HER (Akshada): A caring but funny tip about her cycle. Be sweet but humorous.\n"
        f"2. FOR HIM (Aaryan): A hilarious survival tip. Be dramatic and funny.\n"
        f"Format EXACTLY as:\n"
        f"HER: [message]\n"
        f"HIM: [message]\n"
        f" Keep each under 15 words. Be genuinely funny, not cringe."
    )
    response = await generate(prompt)
    lines = response.strip().split("\n")
    her_msg = "Take care of yourself, queen! 👑"
    him_msg = "Bhai, chocolate leke ready reh! 🍫"
    for line in lines:
        line = line.strip()
        if line.upper().startswith("HER:"):
            her_msg = line[4:].strip()
        elif line.upper().startswith("HIM:"):
            him_msg = line[4:].strip()
    return {"for_her": her_msg, "for_him": him_msg}


# ─── LAST MET ───

async def last_met_comment(days_since: int) -> str:
    if days_since == 0:
        prompt = (
            "You're a dramatic Bollywood narrator. Aaryan and Akshada just met today! "
            "Give ONE sentence dramatic/funny congratulations in Hinglish. "
            "Be over-the-top filmy and excited. Keep under 20 words. No quotes."
        )
    else:
        prompt = (
            f"You're a dramatic Bollywood narrator observing couple Aaryan and Akshada. "
            f"They last met {days_since} days ago. "
            f"Give ONE sentence dramatic/funny commentary in Hinglish about how long it's been. "
            f"{'Be mildly concerned.' if days_since < 7 else 'Be very dramatic and worried.' if days_since < 14 else 'Act like this is a national crisis.'} "
            f"Keep under 20 words. No quotes."
        )
    return await generate(prompt)


# ─── LAST SPECIAL NIGHT ───

async def last_special_comment(days_since: int) -> str:
    if days_since == 0:
        prompt = (
            "You're a cheeky friend who knows too much. Aaryan and Akshada just had a special night tonight! "
            "Give ONE sentence cheeky/funny congratulations in Hinglish. "
            "Keep it PG-13 but suggestive. Under 20 words. No quotes."
        )
    else:
        prompt = (
            f"You're a cheeky friend who knows too much about couple Aaryan and Akshada. "
            f"Their last intimate/special night was {days_since} days ago. "
            f"Give ONE sentence cheeky/funny commentary in Hinglish. "
            f"{'Mildly teasing.' if days_since < 14 else 'Dramatically concerned.' if days_since < 30 else 'Act like you are filing a missing report.'} "
            f"Keep it PG-13 but suggestive. Under 20 words. No quotes."
        )
    return await generate(prompt)


# ─── FOOD SUGGESTER ───

async def suggest_food(food_history: list) -> str:
    # Flatten history for context
    recent_meals = food_history[-10:] if food_history else []
    history_str = ", ".join([" + ".join(meal) for meal in recent_meals]) if recent_meals else "No recent meals recorded"

    prompt = (
        f"You are a food decider for a couple — Aaryan and Akshada. "
        f"They live in Thane. They eat street food mostly. "
        f"She likes sada dosa and pani puri. They also eat omlette paav, ragda patice, "
        f"manchurian bhel, manchurian rice, chicken momos. They rarely go to Taco Bell and KFC. "
        f"\n\nRecent meals they've had: {history_str}"
        f"\n\nSuggest 2-3 items they should eat today. "
        f"Consider what they haven't eaten recently. "
        f"Response in a funny way. "
        f"Format each suggestion on a new line with an emoji. "
        f"Keep the total response under 50 words. Be creative and funny."
    )
    return await generate(prompt)
