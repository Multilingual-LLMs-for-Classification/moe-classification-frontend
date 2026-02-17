import { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const res = await client.get('/api/v1/analytics/summary');
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchAnalytics, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  if (!data && !error) {
    return <div className="page"><div className="loading-msg">Loading analytics...</div></div>;
  }

  return (
    <div className="page analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-desc">Real-time classification metrics and insights.</p>
        </div>
        <div className="analytics-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (10s)</span>
          </label>
          <button className="btn-refresh" onClick={fetchAnalytics}>Refresh</button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="analytics-summary">
            <div className="metric-card">
              <div className="metric-label">Total Requests</div>
              <div className="metric-value">{data.total_requests.toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Confidence</div>
              <div className="metric-value">
                {data.avg_confidence != null ? `${(data.avg_confidence * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-value">
                {data.avg_processing_time_ms != null ? `${data.avg_processing_time_ms.toFixed(1)}ms` : 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Error Rate</div>
              <div className={`metric-value ${data.error_rate > 0 ? 'error-metric' : ''}`}>
                {(data.error_rate * 100).toFixed(2)}%
              </div>
              <div className="metric-subtext">{data.total_errors} errors</div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="analytics-grid">
            <DistributionCard title="Language Distribution" data={data.language_distribution} />
            <DistributionCard title="Domain Distribution" data={data.domain_distribution} />
            <DistributionCard title="Task Distribution" data={data.task_distribution} />
            <ConfidenceCard title="Avg Confidence by Task" data={data.task_avg_confidence} />
          </div>

          {/* Recent Requests */}
          <div className="analytics-section">
            <h3>Recent Classifications</h3>
            <RecentRequestsTable requests={data.recent_requests} />
          </div>
        </>
      )}
    </div>
  );
}

function DistributionCard({ title, data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="analytics-card">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p className="no-data">No data yet</p>
      ) : (
        <div className="bar-chart">
          {entries.map(([label, count]) => (
            <div key={label} className="bar-row">
              <div className="bar-label">{label}</div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <div className="bar-count">{count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfidenceCard({ title, data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="analytics-card">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p className="no-data">No data yet</p>
      ) : (
        <div className="bar-chart">
          {entries.map(([task, confidence]) => (
            <div key={task} className="bar-row">
              <div className="bar-label">{task}</div>
              <div className="bar-container">
                <div className="bar-fill confidence-bar" style={{ width: `${confidence * 100}%` }} />
              </div>
              <div className="bar-count">{(confidence * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentRequestsTable({ requests }) {
  if (!requests || requests.length === 0) {
    return <p className="no-data">No recent requests</p>;
  }

  const sorted = [...requests].reverse();

  return (
    <div className="recent-table-wrapper">
      <table className="recent-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Request ID</th>
            <th>Language</th>
            <th>Domain</th>
            <th>Task</th>
            <th>Confidence</th>
            <th>Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((req, i) => (
            <tr key={req.request_id + '-' + i}>
              <td className="time-cell">{new Date(req.timestamp).toLocaleTimeString()}</td>
              <td className="mono-cell" title={req.request_id}>{req.request_id.slice(0, 8)}...</td>
              <td>{req.language}</td>
              <td>{req.domain}</td>
              <td>{req.task}</td>
              <td className="confidence-cell">
                {req.confidence != null ? `${(req.confidence * 100).toFixed(1)}%` : 'N/A'}
              </td>
              <td className="time-ms-cell">{req.processing_time_ms.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
