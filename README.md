# Startup AI Cost Calculator

A founder fills in five parameters — requests per day, use case, budget, team size, timeline. Get back a specific Claude architecture recommendation with full monthly cost breakdown, comparison to the naive approach, and implementation roadmap.

Built by [Paul Maclean](https://github.com/PaulMack430) as part of a suite of tools for making AI infrastructure decisions concrete and fast.

---

## The Problem

Most founders default to the most capable model they've heard of (Claude 3.5 Sonnet), use it real-time for everything, and move on. That decision costs them 60–80% more than the optimized approach before they've validated a single assumption.

This calculator makes the right architecture decision visible in 30 seconds.

---

## What It Returns

**Customer View** (tabs for exploring):
- **Architecture** — specific Claude model + deployment pattern (Real-Time API, Batch, Hybrid, or Local LLM)
- **Cost Breakdown** — pie chart showing API tokens vs infrastructure vs tooling, with cost per request
- **Comparison** — side-by-side naive (Sonnet everywhere) vs optimized, with dollar savings
- **Timeline** — implementation roadmap, quick wins, risk flags

**Evangelist Brief** (narrative for decision-makers):
- What they assumed (AI cost = tokens × volume)
- What's really happening (70% of cost is hidden: debug time, churn, complexity, wrong decisions)
- Why Claude wins here (specific to their use case)
- The smart move (exact architecture + why)
- Upgrade signals (metrics that tell you when to change)

---

## Stack

- **Backend:** FastAPI + Anthropic Python SDK (`claude-sonnet-4-6`)
- **Frontend:** React + Vite + Recharts
- **Deployment ready** for Vercel (frontend) + Railway/Render (backend)

---

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY="sk-ant-..."
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Test it:

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "requests_per_day": 5000,
    "use_case": "customer_support",
    "budget_per_month": 500,
    "team_size": 5,
    "needs_realtime": true
  }'
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## How It Works

**Input → Claude Analysis → JSON Output → Two Views**

1. Founder describes their situation (5K requests/day, $500 budget, customer support)
2. FastAPI endpoint sends to Claude with pricing table + token estimates by use case
3. Claude returns JSON: recommended architecture, cost breakdown, upgrade signals, quick wins, risk flags
4. Frontend renders two modes:
   - **Customer View:** interactive tabs with charts (what they explore)
   - **Evangelist Brief:** narrative deck (what you read to them)

The backend makes no assumptions. It doesn't hallucinate models or costs — it cites what's in the system prompt.

---

## Key Features

**Accurate Pricing** — Built-in pricing for Claude 3 Haiku, 3.5 Sonnet, 3 Opus. Batch API discount (50%) factored in.

**Use-Case Token Estimates** — Average token counts for customer support, content generation, code assistance, data classification. Real numbers from real workloads.

**Architecture Routing** — Recommends Real-Time API, Batch API, Hybrid, or Local LLM based on volume, latency requirements, and budget.

**Naive Cost Comparison** — Shows what they'd pay if they defaulted to Sonnet real-time for everything. Highlights the gap.

**Actionable Roadmap** — Not just cost; implementation timeline, quick wins (caching, intent classification, compression), and specific risk flags for their stage.

**Upgrade Signals** — Metrics that tell them when to change architecture (volume thresholds, cost thresholds, latency boundaries, quality metrics).

---

## Scenarios to Try

**1. Tight-Budget Startup (Customer Support)**
- Requests/day: 1,000
- Budget: $300
- Expected: Haiku + Batch API recommendation, ~$50/mo total

**2. Quality-First (Code Assistance)**
- Requests/day: 500
- Budget: $2,000
- Expected: Real-Time Sonnet, reasoning-heavy tasks justified

**3. High-Volume Content (Async OK)**
- Requests/day: 50,000
- Budget: $5,000
- Expected: Batch API + Haiku, 85%+ savings vs naive

**4. Data Classification at Scale**
- Requests/day: 100,000
- Budget: $500
- Expected: Haiku + Batch or Local LLM recommendation

---

## Part of a Larger Suite

| Tool | What it does |
|---|---|
| [**Claude Technical Advisor**](https://github.com/PaulMack430/claude-technical-advisor) | Multi-turn conversation — ask anything about Claude patterns, RAG, prompt caching, tool use |
| [**Claude vs The Field**](https://github.com/PaulMack430/claude-vs-llama-comparison) | Side-by-side TCO across 7 models (Claude, Gemini, Llama, Mistral, etc.) with hallucination rates |
| **AI Cost Calculator** (this repo) | Specific architecture recommendation + monthly cost breakdown |
| **AI Path Forward** | Situational roadmap — phased plan based on where you are now |

---

## Deployment

**Frontend (Vercel):**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

**Backend (Railway/Render):**
```bash
# Push to GitHub
git push
# Connect repo to Railway/Render
# Set ANTHROPIC_API_KEY env var
# Done
```

---

## Extending It

**Add new use cases** — Edit system prompt in `backend/main.py`, add token estimates.

**Add new models** — Update pricing table in system prompt.

**Add what-if sliders** — Let users adjust requests/day or budget and see cost change in real-time (frontend feature).

**Export results** — Add PDF download button showing the brief + cost breakdown.

---

## The Pitch

You didn't guess wrong about needing AI. You guessed wrong about how to use it. This calculator shows you the right way — and how much you'll save.
