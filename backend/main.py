import json, os
from typing import Literal
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Startup AI Cost Calculator", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000"], allow_methods=["POST", "GET"], allow_headers=["*"])
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class CalculatorInput(BaseModel):
    requests_per_day: int = Field(..., ge=1)
    use_case: Literal["customer_support", "content_generation", "code_assistance", "data_classification"]
    budget_per_month: float = Field(..., ge=0)
    team_size: int = Field(..., ge=1)
    needs_realtime: bool

class CostBreakdown(BaseModel):
    api_tokens_usd: float
    infrastructure_usd: float
    tooling_usd: float
    total_usd: float

class UpgradeSignal(BaseModel):
    metric: str
    threshold: str
    action: str

class CalculatorOutput(BaseModel):
    recommended_architecture: str
    model_recommendation: str
    reasoning: str
    monthly_cost: CostBreakdown
    naive_monthly_cost: float
    savings_percentage: float
    cost_per_request_usd: float
    implementation_timeline: str
    upgrade_signals: list[UpgradeSignal]
    quick_wins: list[str]
    risk_flags: list[str]

SYSTEM_PROMPT = """You are an expert AI infrastructure architect. Current Anthropic pricing: Claude 3 Haiku $0.25/$0.80 MTok, Claude 3.5 Sonnet $3.00/$15.00 MTok, Claude 3 Opus $15.00/$75.00 MTok. Batch API 50% off. Avg tokens: customer_support 800/400, content_generation 500/1200, code_assistance 1000/800, data_classification 300/100. Infra: Real-Time $35/mo, Batch $20/mo, Hybrid $60/mo, Local LLM $900/mo. Tooling $15/mo. Naive = Sonnet real-time. Respond ONLY JSON: {"recommended_architecture":"Real-Time API"|"Batch API"|"Hybrid"|"Local LLM","model_recommendation":"string","reasoning":"string","monthly_cost":{"api_tokens_usd":0,"infrastructure_usd":0,"tooling_usd":0,"total_usd":0},"naive_monthly_cost":0,"savings_percentage":0,"cost_per_request_usd":0,"implementation_timeline":"string","upgrade_signals":[{"metric":"","threshold":"","action":""}],"quick_wins":[""],"risk_flags":[""]}"""

@app.post("/calculate", response_model=CalculatorOutput)
async def calculate(payload: CalculatorInput):
    msg = f"Startup AI cost analysis: {payload.requests_per_day:,} req/day, {payload.use_case}, ${payload.budget_per_month}/mo, team {payload.team_size}, realtime={payload.needs_realtime}"
    try:
        m = client.messages.create(model="claude-sonnet-4-6", max_tokens=1000, system=SYSTEM_PROMPT, messages=[{"role":"user","content":msg}])
        raw = m.content[0].text.strip().replace("```json","").replace("```","").strip()
        data = json.loads(raw)
        return CalculatorOutput(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
