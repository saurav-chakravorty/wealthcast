import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend
} from 'recharts';

// Update color palette for better distinction
const CHART_COLORS = {
  median: '#0072B2',    // Blue
  p75: '#009E73',      // Green
  p95: '#D55E00',      // Orange
  p25: '#F0E442',      // Yellow
  p5: '#CC79A7',       // Purple
  other: '#95A5A6'     // Gray for other percentiles
};

// Base URL for the backend API. When running inside Docker this will be
// injected at build time via VITE_BACKEND_URL. Fallback to relative path for
// local development without Docker.
const API_BASE_URL = 'backend.railway.internal:8000'

// Helper to format a number as lakh/crore for input display
const formatINRInput = (value) => {
  if (value === '' || value === null || isNaN(value)) return '';
  value = Number(value);
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)} L`;
  return value.toLocaleString('en-IN');
};

// Helper to parse formatted lakh/crore input back to number
const parseINRInput = (str) => {
  if (!str) return '';
  let s = str.replace(/,/g, '').replace(/\s+/g, '');
  if (s.toLowerCase().endsWith('cr')) return Math.round(parseFloat(s) * 1e7);
  if (s.toLowerCase().endsWith('l')) return Math.round(parseFloat(s) * 1e5);
  return parseInt(s, 10) || 0;
};

// Custom label for percentile lines
const PercentileLabel = ({ x, y, value, label }) => (
  <text x={x + 8} y={y} dy={4} fontSize={13} fontWeight="bold" fill="#444" textAnchor="start">{label}</text>
);

function App() {
  const [form, setForm] = useState({
    initial_corpus: 40000000, // 4 Cr
    current_monthly_expense: 250000, // 2.5 L
    start_year: 2025,
    end_year: 2079,
    expected_return_pct: 12.0,
    return_std_dev_pct: 9.0,
    inflation_pct: 6.0,
    inflation_std_dev_pct: 2.0,
    num_simulations: 100
  });

  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllPercentiles, setShowAllPercentiles] = useState(false);
  const [corpusInput, setCorpusInput] = useState(formatINRInput(10000000));
  const [corpusFocused, setCorpusFocused] = useState(false);
  const [expenseInput, setExpenseInput] = useState(formatINRInput(250000));
  const [expenseFocused, setExpenseFocused] = useState(false);
  const [visibleTraces, setVisibleTraces] = useState({
    p95: true,
    p75: true,
    median: true,
    p25: true,
    p5: true
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleCorpusChange = (e) => {
    const val = e.target.value;
    setCorpusInput(val);
    setForm((prev) => ({ ...prev, initial_corpus: parseINRInput(val) }));
  };

  const handleCorpusBlur = () => {
    setCorpusInput(formatINRInput(form.initial_corpus));
    setCorpusFocused(false);
  };

  const handleCorpusFocus = () => {
    setCorpusInput(form.initial_corpus.toString());
    setCorpusFocused(true);
  };

  const handleExpenseChange = (e) => {
    const val = e.target.value;
    setExpenseInput(val);
    setForm((prev) => ({ ...prev, current_monthly_expense: parseINRInput(val) }));
  };

  const handleExpenseBlur = () => {
    setExpenseInput(formatINRInput(form.current_monthly_expense || 0));
    setExpenseFocused(false);
  };

  const handleExpenseFocus = () => {
    setExpenseInput((form.current_monthly_expense || '').toString());
    setExpenseFocused(true);
  };

  const handleTraceToggle = (trace) => {
    setVisibleTraces((prev) => ({ ...prev, [trace]: !prev[trace] }));
  };

  const fetchSimulationData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSimulationData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSimulationData(data);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch simulation data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format Y-axis ticks to Indian lakh/crore
  const formatINR = (value) => {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`; // Lakh
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}k`;
    return `₹${value}`;
  };

  // Helper to map simulation years to actual years
  const getYear = (index) => form.start_year + index;

  // Helper to map a percentile/path array to actual years
  const mapToActualYears = (arr) => arr.map((pt, idx) => ({ ...pt, year: getYear(idx) }));

  return (
    <div className="app-container">
      <h1>Financial Scenario Analyzer</h1>
      <div className="main-content">
        <div className="input-section">
          <form className="card" onSubmit={fetchSimulationData}>
            <label>
              Initial Corpus (₹):
              <input
                type="text"
                name="initial_corpus"
                value={corpusFocused ? corpusInput : formatINRInput(form.initial_corpus)}
                onChange={handleCorpusChange}
                onBlur={handleCorpusBlur}
                onFocus={handleCorpusFocus}
                min={0}
                required
                autoComplete="off"
                inputMode="numeric"
              />
            </label>
            <label>
              Current Monthly Expense (₹):
              <input
                type="text"
                name="current_monthly_expense"
                value={expenseFocused ? expenseInput : formatINRInput(form.current_monthly_expense || 0)}
                onChange={handleExpenseChange}
                onBlur={handleExpenseBlur}
                onFocus={handleExpenseFocus}
                min={0}
                required
                autoComplete="off"
                inputMode="numeric"
              />
            </label>
            <label>
              Start Year:
              <input type="number" name="start_year" value={form.start_year} onChange={handleChange} min={1900} max={2100} required />
            </label>
            <label>
              End Year:
              <input type="number" name="end_year" value={form.end_year} onChange={handleChange} min={form.start_year} max={2100} required />
            </label>
            <label>
              Expected Return (%):
              <input type="number" name="expected_return_pct" value={form.expected_return_pct} onChange={handleChange} step={0.1} required />
            </label>
            <label>
              Return Std Dev (%):
              <input type="number" name="return_std_dev_pct" value={form.return_std_dev_pct} onChange={handleChange} step={0.1} required />
            </label>
            <label>
              Inflation (%):
              <input type="number" name="inflation_pct" value={form.inflation_pct} onChange={handleChange} step={0.1} required />
            </label>
            <label>
              Inflation Std Dev (%):
              <input type="number" name="inflation_std_dev_pct" value={form.inflation_std_dev_pct} onChange={handleChange} step={0.1} required />
            </label>
            <label>
              Number of Simulations:
              <input type="number" name="num_simulations" value={form.num_simulations} onChange={handleChange} min={1} max={1000} required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Simulating...' : 'Run Monte Carlo Simulation'}
            </button>
          </form>
        </div>

        <div className="chart-section">
          {error && <p className="error">Error: {error}</p>}

          {simulationData && (
            <div className="chart-container">
              <div className="chart-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1em', alignItems: 'center' }}>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showAllPercentiles}
                    onChange={(e) => setShowAllPercentiles(e.target.checked)}
                  />
                  Show All Percentiles
                </label>
                <span style={{ marginLeft: '2em', fontWeight: 500 }}>Show/Hide Percentiles:</span>
                <label style={{ color: CHART_COLORS.p95 }}>
                  <input type="checkbox" checked={visibleTraces.p95} onChange={() => handleTraceToggle('p95')} /> 95th
                </label>
                <label style={{ color: CHART_COLORS.p75 }}>
                  <input type="checkbox" checked={visibleTraces.p75} onChange={() => handleTraceToggle('p75')} /> 75th
                </label>
                <label style={{ color: CHART_COLORS.median }}>
                  <input type="checkbox" checked={visibleTraces.median} onChange={() => handleTraceToggle('median')} /> 50th
                </label>
                <label style={{ color: CHART_COLORS.p25 }}>
                  <input type="checkbox" checked={visibleTraces.p25} onChange={() => handleTraceToggle('p25')} /> 25th
                </label>
                <label style={{ color: CHART_COLORS.p5 }}>
                  <input type="checkbox" checked={visibleTraces.p5} onChange={() => handleTraceToggle('p5')} /> 5th
                </label>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    domain={[form.start_year, form.end_year]}
                    tickCount={form.end_year - form.start_year + 1}
                    label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={formatINR}
                    label={{ value: 'Portfolio Value\n(INR)', angle: -90, position: 'insideLeft', offset: 0 }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    labelFormatter={(year) => `Year: ${year}`}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="plainline"/>
                  {/* Conditionally render each percentile line based on visibility */}
                  {visibleTraces.p95 && (
                    <Line
                      type="monotone"
                      data={mapToActualYears(simulationData.percentiles.p95)}
                      dataKey="value"
                      stroke={CHART_COLORS.p95}
                      strokeWidth={2}
                      dot={false}
                      name="95th Percentile"
                    />
                  )}
                  {visibleTraces.p75 && (
                    <Line
                      type="monotone"
                      data={mapToActualYears(simulationData.percentiles.p75)}
                      dataKey="value"
                      stroke={CHART_COLORS.p75}
                      strokeWidth={2}
                      dot={false}
                      name="75th Percentile"
                    />
                  )}
                  {visibleTraces.median && (
                    <Line
                      type="monotone"
                      data={mapToActualYears(simulationData.percentiles.median)}
                      dataKey="value"
                      stroke={CHART_COLORS.median}
                      strokeWidth={2}
                      dot={false}
                      name="50th Percentile (Median)"
                    />
                  )}
                  {visibleTraces.p25 && (
                    <Line
                      type="monotone"
                      data={mapToActualYears(simulationData.percentiles.p25)}
                      dataKey="value"
                      stroke={CHART_COLORS.p25}
                      strokeWidth={2}
                      dot={false}
                      name="25th Percentile"
                    />
                  )}
                  {visibleTraces.p5 && (
                    <Line
                      type="monotone"
                      data={mapToActualYears(simulationData.percentiles.p5)}
                      dataKey="value"
                      stroke={CHART_COLORS.p5}
                      strokeWidth={2}
                      dot={false}
                      name="5th Percentile"
                    />
                  )}
                  {/* Show other percentiles only when toggled, mapped to actual years */}
                  {showAllPercentiles && simulationData.paths.map((path, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      data={mapToActualYears(path)}
                      dataKey="value"
                      stroke={CHART_COLORS.other}
                      strokeOpacity={0.2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
