import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { projectsApi } from '../api/projects';

const TABS = ['Overview', 'Per Task', 'Per Language', 'Per User', 'History'];

export default function ProjectAnalyticsPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [activeTab, setActiveTab] = useState('Overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await projectsApi.getSummary(id);
      setSummary(data);
      setError('');
    } catch {
      setError('Failed to fetch analytics.');
    }
  }, [id]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) intervalRef.current = setInterval(fetchSummary, 15000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, fetchSummary]);

  return (
    <div className="project-section">
      <div className="analytics-header" style={{ marginBottom: '1rem' }}>
        <div />
        <div className="analytics-controls">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            <span>Auto-refresh (15s)</span>
          </label>
          <button className="btn-refresh" onClick={fetchSummary}>Refresh</button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {summary && <KpiCards data={summary} />}

      <div className="analytics-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`analytics-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && <OverviewTab id={id} summary={summary} />}
      {activeTab === 'Per Task' && <PerTaskTab id={id} />}
      {activeTab === 'Per Language' && <PerLanguageTab id={id} />}
      {activeTab === 'Per User' && <PerUserTab id={id} />}
      {activeTab === 'History' && <HistoryTab id={id} />}
    </div>
  );
}

function KpiCards({ data }) {
  return (
    <div className="analytics-summary">
      <div className="metric-card">
        <div className="metric-label">Total Requests</div>
        <div className="metric-value">{data.total_requests.toLocaleString()}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total Errors</div>
        <div className={`metric-value ${data.total_errors > 0 ? 'error-metric' : ''}`}>
          {data.total_errors.toLocaleString()}
        </div>
        <div className="metric-subtext">{(data.error_rate * 100).toFixed(2)}% error rate</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Avg Latency</div>
        <div className="metric-value">
          {data.avg_processing_time_ms != null ? `${data.avg_processing_time_ms.toFixed(0)}ms` : 'N/A'}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ id, summary }) {
  const [tsData, setTsData] = useState([]);
  const [bucket, setBucket] = useState('day');
  const [days, setDays] = useState(14);
  const [tsLoading, setTsLoading] = useState(true);

  const fetchTs = useCallback(async () => {
    setTsLoading(true);
    try {
      const data = await projectsApi.getTimeseries(id, bucket, days);
      setTsData(data);
    } catch {
      setTsData([]);
    } finally {
      setTsLoading(false);
    }
  }, [id, bucket, days]);

  useEffect(() => { fetchTs(); }, [fetchTs]);

  const formatted = tsData.map((d) => ({
    ...d,
    label: formatBucketLabel(d.bucket, bucket),
  }));

  return (
    <>
      <div className="analytics-section">
        <div className="section-header-row">
          <h3>Requests Over Time</h3>
          <div className="ts-controls">
            <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
            </select>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={1}>Last 1 day</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </div>

        {tsLoading ? (
          <div className="loading-msg">Loading chart...</div>
        ) : tsData.length === 0 ? (
          <p className="no-data">No data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3248" />
              <XAxis dataKey="label" tick={{ fill: '#8b8fa3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b8fa3', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2e3248', borderRadius: 8 }} labelStyle={{ color: '#e4e6ef' }} />
              <Legend wrapperStyle={{ color: '#8b8fa3', fontSize: 12 }} />
              <Line type="monotone" dataKey="success" stroke="#6366f1" strokeWidth={2} dot={false} name="Success" />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={false} name="Errors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {summary && (
        <div className="analytics-grid">
          <DistributionCard title="Language Distribution" data={summary.language_distribution} />
          <DistributionCard title="Task Distribution" data={summary.task_distribution} />
        </div>
      )}

      {summary && summary.recent_requests.length > 0 && (
        <div className="analytics-section">
          <h3>Recent Classifications</h3>
          <RecentTable requests={summary.recent_requests} />
        </div>
      )}
    </>
  );
}

function PerTaskTab({ id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    projectsApi.getPerTask(id).then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div className="loading-msg">Loading per-task metrics...</div>;
  return (
    <div className="analytics-section">
      <h3>Per-Task Breakdown</h3>
      {data.length === 0 ? <p className="no-data">No task data yet.</p> : (
        <MetricsTable
          columns={['Task', 'Requests', 'Errors', 'Error Rate', 'Avg Latency']}
          rows={data.map((row) => [
            <span className="task-name-cell">{row.task}</span>,
            row.total_requests.toLocaleString(),
            <span className={row.error_count > 0 ? 'error-cell' : ''}>{row.error_count}</span>,
            <span className={row.error_rate > 0.05 ? 'error-cell' : ''}>{(row.error_rate * 100).toFixed(1)}%</span>,
            <span className="latency-cell">{row.avg_latency_ms != null ? `${row.avg_latency_ms.toFixed(0)}ms` : '—'}</span>,
          ])}
        />
      )}
    </div>
  );
}

function PerLanguageTab({ id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    projectsApi.getPerLanguage(id).then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div className="loading-msg">Loading per-language metrics...</div>;
  return (
    <div className="analytics-section">
      <h3>Per-Language Breakdown</h3>
      {data.length === 0 ? <p className="no-data">No language data yet.</p> : (
        <MetricsTable
          columns={['Language', 'Requests', 'Errors', 'Error Rate', 'Avg Latency']}
          rows={data.map((row) => [
            <span className="task-name-cell">{row.language}</span>,
            row.total_requests.toLocaleString(),
            <span className={row.error_count > 0 ? 'error-cell' : ''}>{row.error_count}</span>,
            <span className={row.error_rate > 0.05 ? 'error-cell' : ''}>{(row.error_rate * 100).toFixed(1)}%</span>,
            <span className="latency-cell">{row.avg_latency_ms != null ? `${row.avg_latency_ms.toFixed(0)}ms` : '—'}</span>,
          ])}
        />
      )}
    </div>
  );
}

function PerUserTab({ id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    projectsApi.getPerUser(id).then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div className="loading-msg">Loading per-user metrics...</div>;
  return (
    <div className="analytics-section">
      <h3>Per-User Usage</h3>
      {data.length === 0 ? <p className="no-data">No user data yet.</p> : (
        <MetricsTable
          columns={['Username', 'Total Requests', 'Errors', 'Last Active']}
          rows={data.map((row) => [
            <span className="task-name-cell">{row.username}</span>,
            row.total_requests.toLocaleString(),
            <span className={row.error_count > 0 ? 'error-cell' : ''}>{row.error_count}</span>,
            <span className="time-cell">{row.last_active ? new Date(row.last_active).toLocaleString() : '—'}</span>,
          ])}
        />
      )}
    </div>
  );
}

function HistoryTab({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ task: '', language: '' });
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (filters.task) params.task = filters.task;
      if (filters.language) params.language = filters.language;
      setData(await projectsApi.getHistory(id, params));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, page, filters]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div className="analytics-section">
      <h3>Request History</h3>
      <form className="history-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); }}>
        <input placeholder="Task" value={filters.task} onChange={(e) => setFilters((f) => ({ ...f, task: e.target.value }))} />
        <input placeholder="Language" value={filters.language} onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))} />
        <button type="submit" className="btn-filter">Filter</button>
        <button type="button" className="btn-filter secondary" onClick={() => { setFilters({ task: '', language: '' }); setPage(1); }}>Clear</button>
      </form>

      {loading ? <div className="loading-msg">Loading...</div>
        : !data ? <p className="no-data">Failed to load history.</p>
        : data.items.length === 0 ? <p className="no-data">No records found.</p>
        : (
          <>
            <MetricsTable
              columns={['Time', 'User', 'Language', 'Task', 'Result', 'Latency', 'Status']}
              rows={data.items.map((row) => [
                <span className="time-cell">{new Date(row.timestamp).toLocaleString()}</span>,
                row.username || '—',
                row.language || '—',
                row.task || '—',
                <span className="mono-cell">{row.result || '—'}</span>,
                <span className="latency-cell">{row.processing_time_ms != null ? `${row.processing_time_ms.toFixed(0)}ms` : '—'}</span>,
                <span className={`status-badge ${row.is_error ? 'status-warn' : 'status-ok'}`}>{row.is_error ? 'Error' : 'OK'}</span>,
              ])}
            />
            <div className="pagination">
              <span className="pagination-info">{data.total.toLocaleString()} total — page {data.page} of {data.pages}</span>
              <div className="pagination-btns">
                <button className="btn-page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <button className="btn-page" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}

// ── Shared display components ──

function MetricsTable({ columns, rows }) {
  return (
    <div className="metrics-table-wrapper">
      <table className="metrics-table">
        <thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr></thead>
        <tbody>{rows.map((cells, i) => <tr key={i}>{cells.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function DistributionCard({ title, data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);
  return (
    <div className="analytics-card">
      <h3>{title}</h3>
      {entries.length === 0 ? <p className="no-data">No data yet</p> : (
        <div className="bar-chart">
          {entries.map(([label, count]) => (
            <div key={label} className="bar-row">
              <div className="bar-label">{label}</div>
              <div className="bar-container"><div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
              <div className="bar-count">{count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentTable({ requests }) {
  return (
    <MetricsTable
      columns={['Time', 'User', 'Language', 'Task', 'Latency']}
      rows={requests.map((req, i) => [
        <span key={i} className="time-cell">{new Date(req.timestamp).toLocaleTimeString()}</span>,
        req.username || '—',
        req.language,
        req.task,
        <span className="latency-cell">{req.processing_time_ms.toFixed(0)}ms</span>,
      ])}
    />
  );
}

function formatBucketLabel(isoString, bucket) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (bucket === 'hour') return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
