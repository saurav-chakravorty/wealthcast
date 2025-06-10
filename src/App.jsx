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
  ResponsiveContainer
} from 'recharts';

// Define aesthetic colors for different percentiles
const CHART_COLORS = {
  median: '#2E86C1',    // Blue
  p25: '#27AE60',      // Green
  p75: '#27AE60',      // Green
  p5: '#E74C3C',       // Red
  p95: '#E74C3C',      // Red
  other: '#95A5A6'     // Gray for other percentiles
};

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

function App() {
  const [form, setForm] = useState({
    initial_corpus: 100000,
    start_year: 2025,
    end_year: 2045,
    expected_return_pct: 8.0,
    return_std_dev_pct: 12.0,
    inflation_pct: 2.5,
    inflation_std_dev_pct: 1.0,
    num_simulations: 100
  });

  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllPercentiles, setShowAllPercentiles] = useState(false);
  const [corpusInput, setCorpusInput] = useState(formatINRInput(form.initial_corpus));
  const [corpusFocused, setCorpusFocused] = useState(false);
  const [expenseInput, setExpenseInput] = useState('');
  const [expenseFocused, setExpenseFocused] = useState(false);

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

  const fetchSimulationData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSimulationData(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/simulate', {
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
              <div className="chart-controls">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showAllPercentiles}
                    onChange={(e) => setShowAllPercentiles(e.target.checked)}
                  />
                  Show All Percentiles
                </label>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    label={{ value: 'Portfolio Value (INR)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    labelFormatter={(year) => `Year: ${year}`}
                  />
                  
                  {/* Always show main percentiles, mapped to actual years */}
                  <Line
                    type="monotone"
                    data={mapToActualYears(simulationData.percentiles.median)}
                    dataKey="value"
                    stroke={CHART_COLORS.median}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    data={mapToActualYears(simulationData.percentiles.p25)}
                    dataKey="value"
                    stroke={CHART_COLORS.p25}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    data={mapToActualYears(simulationData.percentiles.p75)}
                    dataKey="value"
                    stroke={CHART_COLORS.p75}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    data={mapToActualYears(simulationData.percentiles.p5)}
                    dataKey="value"
                    stroke={CHART_COLORS.p5}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    data={mapToActualYears(simulationData.percentiles.p95)}
                    dataKey="value"
                    stroke={CHART_COLORS.p95}
                    strokeWidth={2}
                    dot={false}
                  />

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
