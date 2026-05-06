import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { getSummary } from '../api/analytics';
import { getSystemStats } from '../api/system';

export default function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sysStats, setSysStats] = useState(null);
  const [error, setError] = useState('');
  const sysIntervalRef = useRef(null);

  // Fetch service info once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, statsRes, summaryRes] = await Promise.allSettled([
          client.get('/api/v1/health/ready'),
          client.get('/api/v1/classify/stats'),
          getSummary(),
        ]);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
        if (healthRes.status === 'rejected' && statsRes.status === 'rejected') {
          setError('Could not reach the backend service.');
        }
      } catch {
        setError('Failed to fetch system data.');
      }
    };
    fetchData();
  }, []);

  // Poll system resources every 5 seconds
  const fetchSys = async () => {
    try {
      setSysStats(await getSystemStats());
    } catch {
      /* silently ignore — service may be starting */
    }
  };

  useEffect(() => {
    fetchSys();
    sysIntervalRef.current = setInterval(fetchSys, 5000);
    return () => clearInterval(sysIntervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page dashboard-page">
      <h1>System Dashboard</h1>

      {error && <div className="error-msg">{error}</div>}

      {/* All-time analytics KPIs */}
      {summary && (
        <div className="dashboard-kpi-row">
          <div className="dash-kpi">
            <div className="dash-kpi-label">All-Time Requests</div>
            <div className="dash-kpi-value">{summary.total_requests.toLocaleString()}</div>
          </div>
          <div className="dash-kpi">
            <div className="dash-kpi-label">All-Time Errors</div>
            <div className={`dash-kpi-value ${summary.total_errors > 0 ? 'kpi-error' : ''}`}>
              {summary.total_errors.toLocaleString()}
            </div>
          </div>
          <div className="dash-kpi">
            <div className="dash-kpi-label">Avg Latency</div>
            <div className="dash-kpi-value">
              {summary.avg_processing_time_ms != null ? `${summary.avg_processing_time_ms.toFixed(0)}ms` : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Live system resources */}
      {sysStats && <SystemResources data={sysStats} />}

      {/* Service info cards */}
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

// ─── System Resources Panel ──────────────────────────────────────────────────
function SystemResources({ data }) {
  return (
    <div className="sys-resources">
      <div className="sys-resources-header">
        <h3>Host Resources</h3>
        <span className="sys-live-badge">● Live</span>
      </div>

      <div className="sys-grid">
        {/* CPU */}
        <ResourceCard title="CPU" icon="⚙">
          <GaugeBar
            value={data.cpu.usage_percent}
            label={`${data.cpu.usage_percent.toFixed(1)}%`}
            color={gaugeColor(data.cpu.usage_percent)}
          />
          <div className="sys-meta-row">
            <span>{data.cpu.count_physical}C / {data.cpu.count_logical}T</span>
            {data.cpu.freq_mhz && <span>{(data.cpu.freq_mhz / 1000).toFixed(2)} GHz</span>}
          </div>
        </ResourceCard>

        {/* RAM */}
        <ResourceCard title="Memory" icon="🧠">
          <GaugeBar
            value={data.memory.usage_percent}
            label={`${data.memory.usage_percent.toFixed(1)}%`}
            color={gaugeColor(data.memory.usage_percent)}
          />
          <div className="sys-meta-row">
            <span>{data.memory.used_gb} GB used</span>
            <span>{data.memory.total_gb} GB total</span>
          </div>
        </ResourceCard>

        {/* Disk */}
        <ResourceCard title="Disk" icon="💾">
          <GaugeBar
            value={data.disk.usage_percent}
            label={`${data.disk.usage_percent.toFixed(1)}%`}
            color={gaugeColor(data.disk.usage_percent)}
          />
          <div className="sys-meta-row">
            <span>{data.disk.used_gb} GB used</span>
            <span>{data.disk.total_gb} GB total</span>
          </div>
        </ResourceCard>

        {/* GPU(s) */}
        {data.gpus.length > 0 ? (
          data.gpus.map((gpu) => (
            <ResourceCard key={gpu.index} title={`GPU ${gpu.index}`} icon="⚡" subtitle={gpu.name}>
              <div className="sys-sub-label">Utilization</div>
              <GaugeBar
                value={gpu.utilization_percent}
                label={`${gpu.utilization_percent}%`}
                color={gaugeColor(gpu.utilization_percent)}
              />
              <div className="sys-sub-label" style={{ marginTop: '0.6rem' }}>VRAM</div>
              <GaugeBar
                value={gpu.memory_usage_percent}
                label={`${gpu.memory_usage_percent.toFixed(1)}%`}
                color={gaugeColor(gpu.memory_usage_percent)}
              />
              <div className="sys-meta-row">
                <span>{(gpu.memory_used_mb / 1024).toFixed(1)} GB used</span>
                <span>{(gpu.memory_total_mb / 1024).toFixed(1)} GB total</span>
                {gpu.temperature_c != null && (
                  <span className={gpu.temperature_c > 80 ? 'temp-hot' : 'temp-ok'}>
                    {gpu.temperature_c}°C
                  </span>
                )}
              </div>
            </ResourceCard>
          ))
        ) : (
          <ResourceCard title="GPU" icon="⚡">
            <p className="sys-na">No GPU detected</p>
          </ResourceCard>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ title, icon, subtitle, children }) {
  return (
    <div className="sys-card">
      <div className="sys-card-header">
        <span className="sys-card-icon">{icon}</span>
        <div>
          <div className="sys-card-title">{title}</div>
          {subtitle && <div className="sys-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function GaugeBar({ value, label, color }) {
  return (
    <div className="gauge-bar-wrapper">
      <div className="gauge-bar-track">
        <div
          className="gauge-bar-fill"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
      <span className="gauge-bar-label">{label}</span>
    </div>
  );
}

function gaugeColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#eab308';
  return '#6366f1';
}
