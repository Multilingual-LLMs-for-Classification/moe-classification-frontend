import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();

  const isConfigRoute = location.pathname.startsWith('/config');

  // Auto-open config sub-menu when navigating to a config route
  useEffect(() => {
    if (isConfigRoute && !configOpen) setConfigOpen(true);
  }, [isConfigRoute]);

  if (!isAuthenticated) return null;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '\u276F' : '\u276E'}
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/classify" className="sidebar-item">
          <span className="sidebar-icon">&#10070;</span>
          {!collapsed && <span className="sidebar-label">Classify</span>}
        </NavLink>

        <NavLink to="/dashboard" className="sidebar-item">
          <span className="sidebar-icon">&#9632;</span>
          {!collapsed && <span className="sidebar-label">Dashboard</span>}
        </NavLink>

        <NavLink to="/analytics" className="sidebar-item">
          <span className="sidebar-icon">&#9650;</span>
          {!collapsed && <span className="sidebar-label">Analytics</span>}
        </NavLink>

        {/* Configuration with sub-items */}
        <div className="sidebar-group">
          <button
            className={`sidebar-item sidebar-group-toggle ${isConfigRoute ? 'active' : ''}`}
            onClick={() => setConfigOpen(!configOpen)}
          >
            <span className="sidebar-icon">&#9881;</span>
            {!collapsed && (
              <>
                <span className="sidebar-label">Configuration</span>
                <span className={`sidebar-chevron ${configOpen ? 'open' : ''}`}>&#9662;</span>
              </>
            )}
          </button>

          {configOpen && !collapsed && (
            <div className="sidebar-subitems">
              <NavLink to="/config/base-models" className="sidebar-subitem">
                Base Models
              </NavLink>
              <NavLink to="/config/tasks" className="sidebar-subitem">
                Tasks
              </NavLink>
              <NavLink to="/config/router" className="sidebar-subitem">
                Router Config
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
