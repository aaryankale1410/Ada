"""
Supabase-based persistence layer for couple's website data.
"""
import os
from datetime import date, datetime
from supabase import create_client, Client

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_KEY", "")

# We only initialize if keys are present so local dev doesn't crash instantly before setting up keys
supabase: Client | None = None
if url and key:
    supabase = create_client(url, key)


# --- Cache ---

def get_cached_llm(key: str):
    """Get cached LLM message for today, if it exists."""
    if not supabase: return None
    response = supabase.table('llm_cache').select("*").eq("category", key).execute()
    data = response.data
    if data and len(data) > 0:
        row = data[0]
        if row.get("cached_date") == date.today().isoformat():
            return row.get("data")
    return None

def set_cached_llm(key: str, llm_data) -> None:
    """Set cached LLM message for today."""
    if not supabase: return
    supabase.table('llm_cache').upsert({
        "category": key,
        "cached_date": date.today().isoformat(),
        "data": llm_data
    }).execute()

def clear_cached_llm(key: str) -> None:
    """Clear cached LLM message."""
    if not supabase: return
    supabase.table('llm_cache').delete().eq("category", key).execute()


# --- Period ---

def get_period_data() -> dict:
    if not supabase:
        return {"last_period": "2026-03-31", "next_period": "2026-04-26", "cycle_length": 26, "days_until": 0, "days_since": 0}
        
    response = supabase.table('dates').select("*").eq("id", 1).execute()
    row = response.data[0]
    
    last_period = datetime.strptime(row["last_period"], "%Y-%m-%d").date()
    cycle_length = row.get("cycle_length", 26)

    from datetime import timedelta
    next_period = last_period + timedelta(days=cycle_length)
    days_until = (next_period - date.today()).days

    return {
        "last_period": row["last_period"],
        "next_period": next_period.isoformat(),
        "cycle_length": cycle_length,
        "days_until": days_until,
        "days_since": (date.today() - last_period).days,
    }

def update_period() -> dict:
    if supabase:
        today_str = date.today().isoformat()
        supabase.table('dates').update({"last_period": today_str}).eq("id", 1).execute()
    return get_period_data()


# --- Last Met ---

def get_last_met() -> dict:
    if not supabase:
        return {"last_met": "2026-04-03", "days_since": 0}

    response = supabase.table('dates').select("last_met").eq("id", 1).execute()
    row = response.data[0]
    
    last_met = datetime.strptime(row["last_met"], "%Y-%m-%d").date()
    days_since = (date.today() - last_met).days
    return {
        "last_met": row["last_met"],
        "days_since": days_since,
    }

def update_last_met() -> dict:
    if supabase:
        today_str = date.today().isoformat()
        supabase.table('dates').update({"last_met": today_str}).eq("id", 1).execute()
    return get_last_met()


# --- Last Special ---

def get_last_special() -> dict:
    if not supabase:
        return {"last_special": "2026-02-20", "days_since": 0}

    response = supabase.table('dates').select("last_special").eq("id", 1).execute()
    row = response.data[0]
    
    last_special = datetime.strptime(row["last_special"], "%Y-%m-%d").date()
    days_since = (date.today() - last_special).days
    return {
        "last_special": row["last_special"],
        "days_since": days_since,
    }

def update_last_special() -> dict:
    if supabase:
        today_str = date.today().isoformat()
        supabase.table('dates').update({"last_special": today_str}).eq("id", 1).execute()
    return get_last_special()


# --- Food ---

def get_food_history() -> list:
    if not supabase: return []
    response = supabase.table('food_history').select("items").order('created_at', desc=True).limit(50).execute()
    # It returns a list of dictionaries
    history = [row["items"] for row in response.data]
    # Reverse it back so oldest is first
    return history[::-1]

def add_food(items: list[str]) -> list:
    if supabase:
        supabase.table('food_history').insert({"items": items}).execute()
    return get_food_history()
