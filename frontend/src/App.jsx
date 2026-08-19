import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import "./App.css";

const API_BASE = "";
const USE_CASES = [
  { value: "customer_support", label: "Customer Support" },
  { value: "content_generation", label: "Content Generation" },
  { value: "code_assistance", label: "Code Assistance" },
  { value: "data_classification", label: "Data Classification" }
];

function AnimNum({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const dur = 700, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

function CustomerView({ result }) {
  const [tab, setTab] = useState("arch");
  
  const costData = [
    { name: "API Tokens", value: result.monthly_cost.api_tokens_usd },
    { name: "Infrastructure", value: result.monthly_cost.infrastructure_usd },
    { name: "Tooling", value: result.monthly_cost.tooling_usd }
  ];
  
  const comparisonData = [
    { category: "Naive Approach", cost: result.naive_monthly_cost },
    { category: "Optimized Approach", cost: result.monthly_cost.total_usd }
  ];

  const COLORS = ["#6EE7B7", "#818CF8", "#FCD34D"];

  return (
    <div className="view-container">
      <div className="tabs">
        <button className={`tab ${tab === "arch" ? "active" : ""}`} onClick={() => setTab("arch")}>Architecture</button>
        <button className={`tab ${tab === "cost" ? "active" : ""}`} onClick={() => setTab("cost")}>Cost Breakdown</button>
        <button className={`tab ${tab === "compare" ? "active" : ""}`} onClick={() => setTab("compare")}>Comparison</button>
        <button className={`tab ${tab === "timeline" ? "active" : ""}`} onClick={() => setTab("timeline")}>Timeline</button>
      </div>

      <div className="tab-content">
        {tab === "arch" && (
          <div className="tab-pane">
            <h3>{result.recommended_architecture}</h3>
            <div className="chip">{result.model_recommendation}</div>
            <p className="reasoning">{result.reasoning}</p>
            <div className="signals">
              <h4>Upgrade Signals</h4>
              {result.upgrade_signals.map((s, i) => (
                <div key={i} className="signal">
                  <div className="signal-metric">{s.metric}</div>
                  <div className="signal-threshold">{s.threshold}</div>
                  <div className="signal-action">→ {s.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "cost" && (
          <div className="tab-pane">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={costData} cx="50%" cy="50%" labelLine={false} label={({name, value}) => `${name}: $${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {costData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="cost-table">
              <div className="row"><span>API Tokens</span><span>${result.monthly_cost.api_tokens_usd.toFixed(2)}</span></div>
              <div className="row"><span>Infrastructure</span><span>${result.monthly_cost.infrastructure_usd.toFixed(2)}</span></div>
              <div className="row"><span>Tooling</span><span>${result.monthly_cost.tooling_usd.toFixed(2)}</span></div>
              <div className="row total"><span>Total / Month</span><span>${result.monthly_cost.total_usd.toFixed(2)}</span></div>
              <div className="row"><span>Cost per Request</span><span>${result.cost_per_request_usd.toFixed(5)}</span></div>
            </div>
          </div>
        )}

        {tab === "compare" && (
          <div className="tab-pane">
            <div className="naive-def">
              <div className="def-label">Naive Approach</div>
              <p className="def-text">Claude 3.5 Sonnet real-time API for 100% of requests, no optimization</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#6EE7B7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="savings-card">
              <div className="savings-amount"><AnimNum value={result.savings_percentage} decimals={1} />%</div>
              <div className="savings-label">cost reduction</div>
              <div className="savings-detail">
                <div>If you defaulted to Sonnet everywhere: ${result.naive_monthly_cost.toFixed(0)}/mo</div>
                <div>With the right architecture: ${result.monthly_cost.total_usd.toFixed(0)}/mo</div>
                <div className="savings-delta">You save: ${(result.naive_monthly_cost - result.monthly_cost.total_usd).toFixed(0)}/mo</div>
              </div>
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="tab-pane">
            <p>{result.implementation_timeline}</p>
            {result.quick_wins && (
              <div className="wins">
                <h4>Quick Wins</h4>
                {result.quick_wins.map((w, i) => <div key={i} className="win">✦ {w}</div>)}
              </div>
            )}
            {result.risk_flags && (
              <div className="risks">
                <h4>Risk Flags</h4>
                {result.risk_flags.map((r, i) => <div key={i} className="risk">⚠ {r}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EvangelistView({ result }) {
  return (
    <div className="evangelist-view">
      <section className="section">
        <h3>What You Assumed</h3>
        <div className="assumption">
          <p>AI cost = API token price × volume</p>
          <p>Pick the most capable model. It's the best.</p>
          <p>Real-time is necessary "just in case."</p>
          <p>Scaling = throw more money at the same setup.</p>
        </div>
      </section>

      <section className="section">
        <h3>What's Really Happening</h3>
        <div className="reality">
          <p><strong>API tokens are only 20-30% of your real cost.</strong></p>
          <p>The other 70%?</p>
          <ul>
            <li>Engineer time debugging hallucinations</li>
            <li>Customer churn from bad outputs</li>
            <li>Operational complexity and overhead</li>
            <li>Decision-making costs (picking the wrong model)</li>
          </ul>
          <div className="breakdown-card">
            <div className="breakdown-row"><span>API Tokens</span><span className="val">${result.monthly_cost.api_tokens_usd.toFixed(0)}</span></div>
            <div className="breakdown-row"><span>Engineer Debug Time</span><span className="val">~${(result.monthly_cost.total_usd * 0.3).toFixed(0)}</span></div>
            <div className="breakdown-row"><span>Infrastructure</span><span className="val">${result.monthly_cost.infrastructure_usd.toFixed(0)}</span></div>
            <div className="breakdown-row total"><span>REAL COST</span><span className="val">${result.monthly_cost.total_usd.toFixed(0)}</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <h3>Why {result.recommended_architecture} Wins</h3>
        <div className="recommendation">
          <p><strong>{result.model_recommendation}</strong></p>
          <p className="reasoning">{result.reasoning}</p>
          <p className="savings">You save <strong><AnimNum value={result.savings_percentage} decimals={1} />%</strong> vs defaulting to Sonnet everywhere.</p>
        </div>
      </section>

      <section className="section">
        <h3>The Smart Move (This Week)</h3>
        <div className="action-card">
          <div className="action-heading">Architecture: {result.recommended_architecture}</div>
          <div className="action-detail">Model: {result.model_recommendation}</div>
          <div className="action-detail">Timeline: {result.implementation_timeline}</div>
        </div>
      </section>

      <section className="section">
        <h3>Watch These Metrics</h3>
        <div className="metrics">
          {result.upgrade_signals.map((s, i) => (
            <div key={i} className="metric-item">
              <div className="metric-name">{s.metric}</div>
              <div className="metric-threshold">When: {s.threshold}</div>
              <div className="metric-action">Then: {s.action}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>The Bottom Line</h3>
        <div className="bottom-line">
          <p>You didn't guess wrong about needing AI. You just guessed wrong about how to use it.</p>
          <p>This architecture saves you <strong>${(result.naive_monthly_cost - result.monthly_cost.total_usd).toFixed(0)}/month</strong> and gives you better results.</p>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    requestsPerDay: 5000,
    useCase: "customer_support",
    budget: 500,
    teamSize: 5,
    needsRealtime: true
  });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("customer");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests_per_day: form.requestsPerDay,
          use_case: form.useCase,
          budget_per_month: form.budget,
          team_size: form.teamSize,
          needs_realtime: form.needsRealtime
        })
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      data._budget = form.budget;
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div><div className="eyebrow">// startup ai cost calculator</div>
          <h1 className="title">Know your real <span>AI costs</span> before you build.</h1></div>
          {result && (
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === "customer" ? "active" : ""}`} onClick={() => setMode("customer")}>Customer View</button>
              <button className={`mode-btn ${mode === "evangelist" ? "active" : ""}`} onClick={() => setMode("evangelist")}>Evangelist Brief</button>
            </div>
          )}
        </div>
        <p className="subtitle">Get precise architecture recommendations and cost breakdowns in 30 seconds.</p>
      </header>

      <div className="body">
        <div className="form-card">
          <div className="section-label">Parameters</div>
          <div className="field">
            <label>Requests per day</label>
            <input type="number" min="1" value={form.requestsPerDay} onChange={e => set("requestsPerDay", Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Use case</label>
            <select value={form.useCase} onChange={e => set("useCase", e.target.value)}>
              {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Monthly budget (USD)</label>
            <input type="number" min="0" value={form.budget} onChange={e => set("budget", Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Team size</label>
            <input type="number" min="1" value={form.teamSize} onChange={e => set("teamSize", Number(e.target.value))} />
          </div>
          <div className="field">
            <label>
              <input type="checkbox" checked={form.needsRealtime} onChange={e => set("needsRealtime", e.target.checked)} />
              Needs real-time responses
            </label>
          </div>
          <button className="cta" onClick={handleSubmit} disabled={status === "loading"}>
            {status === "loading" ? "Calculating..." : "Calculate →"}
          </button>
        </div>

        <div className="results">
          {status === "idle" && <div className="empty"><div className="empty-icon">⚡</div><div className="empty-title">Fill in parameters</div></div>}
          {status === "loading" && <div className="loading"><div className="ring" /></div>}
          {status === "error" && <div className="error">{error}</div>}
          {status === "done" && result && (mode === "customer" ? <CustomerView result={result} /> : <EvangelistView result={result} />)}
        </div>
      </div>
    </div>
  );
}
