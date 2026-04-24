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

def analyze_history(dates_list, label: str) -> dict:
    if not dates_list:
        return {
            "total_count": 0, "label": label, "this_month": 0, "last_month": 0, 
            "avg_gap_days": 0, "longest_streak": 0, "favorite_day": "None",
            "monthly_breakdown": {}, "all_dates": []
        }
        
    parsed_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in dates_list])
    today = date.today()
    
    this_month_count = sum(1 for d in parsed_dates if d.year == today.year and d.month == today.month)
    
    last_month_y = today.year if today.month > 1 else today.year - 1
    last_month_m = today.month - 1 if today.month > 1 else 12
    last_month_count = sum(1 for d in parsed_dates if d.year == last_month_y and d.month == last_month_m)
    
    gaps = [(parsed_dates[i] - parsed_dates[i-1]).days for i in range(1, len(parsed_dates))]
    avg_gap = round(sum(gaps) / len(gaps)) if gaps else 0
    
    longest_streak = 1 if parsed_dates else 0
    current_streak = 1
    for i in range(1, len(parsed_dates)):
        if (parsed_dates[i] - parsed_dates[i-1]).days == 1:
            current_streak += 1
            longest_streak = max(longest_streak, current_streak)
        else:
            current_streak = 1

    from collections import Counter
    days = [d.strftime("%A") for d in parsed_dates]
    fav_day = Counter(days).most_common(1)[0][0] if days else "None"
    
    breakdown = {}
    for d in parsed_dates:
        m_str = d.strftime("%Y-%m")
        breakdown[m_str] = breakdown.get(m_str, 0) + 1
        
    return {
        "total_count": len(parsed_dates),
        "label": label,
        "this_month": this_month_count,
        "last_month": last_month_count,
        "avg_gap_days": avg_gap,
        "longest_streak": longest_streak,
        "favorite_day": fav_day,
        "monthly_breakdown": breakdown,
        "all_dates": [d.isoformat() for d in sorted(parsed_dates, reverse=True)]
    }

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
        try:
            supabase.table('met_history').insert({"met_date": today_str}).execute()
        except Exception:
            pass # Ignore duplicate inserts for the same day
    return get_last_met()

def get_met_insights() -> dict:
    if not supabase: return analyze_history([], "Times Met")
    response = supabase.table('met_history').select("met_date").execute()
    dates = [row["met_date"] for row in response.data]
    return analyze_history(dates, "Times Met")


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
        try:
            supabase.table('special_history').insert({"special_date": today_str}).execute()
        except Exception:
            pass
    return get_last_special()

def get_special_insights() -> dict:
    if not supabase: return analyze_history([], "Special Nights")
    response = supabase.table('special_history').select("special_date").execute()
    dates = [row["special_date"] for row in response.data]
    return analyze_history(dates, "Special Nights")


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
