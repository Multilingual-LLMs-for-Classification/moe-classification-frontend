import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActiveProject } from '../context/ActiveProjectContext';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const { activeProject } = useActiveProject();
  const [collapsed, setCollapsed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();

  const isConfigRoute = location.pathname.startsWith('/config');

  useEffect(() => {
    if (isConfigRoute && !configOpen) setConfigOpen(true);
  }, [isConfigRoute]);

  if (!isAuthenticated) return null;

  // Show project sub-nav if URL is inside a project OR an active project is selected
  const urlProjectMatch = location.pathname.match(/^\/projects\/(\d+)(\/.*)?$/);
  const urlProjectId = urlProjectMatch ? urlProjectMatch[1] : null;
  const activeProjectId = urlProjectId || (activeProject ? String(activeProject.id) : null);

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
          {!collapsed && <span className="sidebar-badge">Global</span>}
        </NavLink>

        <NavLink to="/projects" className="sidebar-item" end>
          <span className="sidebar-icon">&#9783;</span>
          {!collapsed && <span className="sidebar-label">Projects</span>}
        </NavLink>

        {/* Project sub-nav: shown when browsing a project URL or an active project is selected */}
        {activeProjectId && !collapsed && (
          <div className="sidebar-subitems sidebar-project-subitems">
            <div className="sidebar-project-label">
              {activeProject && !urlProjectId ? activeProject.name : 'Project'}
            </div>
            <NavLink to={`/projects/${activeProjectId}/analytics`} className="sidebar-subitem">
              Analytics
            </NavLink>
            <NavLink to={`/projects/${activeProjectId}/config`} className="sidebar-subitem">
              Configuration
            </NavLink>
          </div>
        )}

        {/* Global Configuration */}
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
              <NavLink to="/config/base-models" className="sidebar-subitem">Base Models</NavLink>
              <NavLink to="/config/router" className="sidebar-subitem">Router Config</NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
