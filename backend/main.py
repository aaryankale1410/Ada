"""
FastAPI backend for Aaryan & Akshada's couple website.
Serves as an API layer between the React frontend and Gemini LLM.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

import data
import llm

app = FastAPI(title="Aaryan & Akshada API", version="1.0.0")

import os

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS — allow frontend dev server and production Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── MODELS ───

class FoodInput(BaseModel):
    items: list[str]


# ─── OPEN WHEN ───

@app.get("/api/open-when/{category}")
async def open_when(category: str):
    handler = llm.OPEN_WHEN_HANDLERS.get(category)
    if not handler:
        raise HTTPException(status_code=400, detail=f"Unknown category: {category}")
    message = await handler()
    return {"category": category, "message": message}


# ─── PERIOD TRACKER ───

@app.get("/api/period")
async def get_period():
    period_data = data.get_period_data()
    comments = data.get_cached_llm("period")
    if not comments:
        comments = await llm.period_comment(
            period_data["days_since"],
            period_data["days_until"]
        )
        data.set_cached_llm("period", comments)
    return {**period_data, "llm": comments}


@app.post("/api/period/update")
async def update_period():
    data.clear_cached_llm("period")
    period_data = data.update_period()
    comments = await llm.period_comment(
        period_data["days_since"],
        period_data["days_until"]
    )
    data.set_cached_llm("period", comments)
    return {**period_data, "llm": comments}


# ─── LAST MET ───

@app.get("/api/last-met")
async def get_last_met():
    met_data = data.get_last_met()
    comment = data.get_cached_llm("last_met")
    if not comment:
        comment = await llm.last_met_comment(met_data["days_since"])
        data.set_cached_llm("last_met", comment)
    return {**met_data, "llm_comment": comment}


@app.post("/api/last-met/update")
async def update_last_met():
    data.clear_cached_llm("last_met")
    met_data = data.update_last_met()
    comment = await llm.last_met_comment(met_data["days_since"])
    data.set_cached_llm("last_met", comment)
    return {**met_data, "llm_comment": comment}


@app.get("/api/last-met/insights")
async def met_insights():
    return data.get_met_insights()


# ─── LAST SPECIAL ───

@app.get("/api/last-special")
async def get_last_special():
    special_data = data.get_last_special()
    comment = data.get_cached_llm("last_special")
    if not comment:
        comment = await llm.last_special_comment(special_data["days_since"])
        data.set_cached_llm("last_special", comment)
    return {**special_data, "llm_comment": comment}


@app.post("/api/last-special/update")
async def update_last_special():
    data.clear_cached_llm("last_special")
    special_data = data.update_last_special()
    comment = await llm.last_special_comment(special_data["days_since"])
    data.set_cached_llm("last_special", comment)
    return {**special_data, "llm_comment": comment}


@app.get("/api/last-special/insights")
async def special_insights():
    return data.get_special_insights()


# ─── FOOD ───

@app.get("/api/food/suggest")
async def suggest_food():
    history = data.get_food_history()
    suggestion = await llm.suggest_food(history)
    return {"suggestion": suggestion}


@app.get("/api/food/history")
async def food_history():
    return {"history": data.get_food_history()}


@app.post("/api/food/add")
async def add_food(food_input: FoodInput):
    updated = data.add_food(food_input.items)
    return {"history": updated}


# ─── PLACES WISHLIST ───

class PlaceInput(BaseModel):
    place: str
    notes: str = ""

class PlaceIdInput(BaseModel):
    id: int


@app.get("/api/places")
async def get_places():
    return data.get_places()


@app.post("/api/places/add")
async def add_place(place_input: PlaceInput):
    return data.add_place(place_input.place, place_input.notes)


@app.post("/api/places/complete")
async def complete_place(place_id_input: PlaceIdInput):
    return data.complete_place(place_id_input.id)


@app.post("/api/places/delete")
async def delete_place(place_id_input: PlaceIdInput):
    return data.delete_place(place_id_input.id)


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
