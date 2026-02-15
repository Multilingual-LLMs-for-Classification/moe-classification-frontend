import { useState, useEffect } from 'react';
import client from '../api/client';

export default function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, statsRes] = await Promise.allSettled([
          client.get('/api/v1/health/ready'),
          client.get('/api/v1/classify/stats'),
        ]);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (healthRes.status === 'rejected' && statsRes.status === 'rejected') {
          setError('Could not reach the backend service.');
        }
      } catch {
        setError('Failed to fetch system data.');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page dashboard-page">
      <h1>System Dashboard</h1>

      {error && <div className="error-msg">{error}</div>}

      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>Service Health</h3>
          {health ? (
            <div className="dash-items">
              <div className="dash-row">
                <span>Status</span>
                <span className={`status-badge ${health.status === 'healthy' ? 'status-ok' : 'status-warn'}`}>
                  {health.status}
                </span>
              </div>
              <div className="dash-row">
                <span>Models Loaded</span>
                <span className={`status-badge ${health.models_loaded ? 'status-ok' : 'status-warn'}`}>
                  {health.models_loaded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          ) : (
            <p className="dash-loading">Loading...</p>
          )}
        </div>

        <div className="dash-card">
          <h3>System Stats</h3>
          {stats ? (
            <div className="dash-items">
              <div className="dash-row">
                <span>Domains</span>
                <span>{stats.total_domains}</span>
              </div>
              <div className="dash-row">
                <span>Tasks</span>
                <span>{stats.total_tasks}</span>
              </div>
              <div className="dash-row">
                <span>Languages</span>
                <span>{stats.supported_languages}</span>
              </div>
            </div>
          ) : (
            <p className="dash-loading">Loading...</p>
          )}
        </div>

        {stats?.domains && (
          <div className="dash-card">
            <h3>Domains</h3>
            <div className="tag-list">
              {stats.domains.map((d) => (
                <span key={d} className="tag">{d}</span>
              ))}
            </div>
          </div>
        )}

        {stats?.all_languages && (
          <div className="dash-card">
            <h3>Supported Languages</h3>
            <div className="tag-list">
              {stats.all_languages.map((l) => (
                <span key={l} className="tag">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
