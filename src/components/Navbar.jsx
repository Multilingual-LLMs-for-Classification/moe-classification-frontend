import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useTheme } from '../context/ThemeContext';

function AvatarCircle({ avatar, displayName, username, size = 32 }) {
  const initials = (displayName || username || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  if (avatar) {
    return (
      <img
        src={avatar}
        alt="avatar"
        className="nav-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className="nav-avatar-initials" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

function ProjectSwitcher() {
  const { projects, activeProject, setActiveProject } = useActiveProject();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="project-switcher" ref={ref}>
      <button
        className="project-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        title="Switch project"
      >
        <span className="project-switcher-dot" />
        <span className="project-switcher-name">
          {activeProject ? activeProject.name : 'No Project'}
        </span>
        <span className="nav-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="project-switcher-dropdown">
          <div className="project-switcher-header">Active Project</div>
          {projects.length === 0 && (
            <div className="project-switcher-empty">No projects yet</div>
          )}
          {projects.map((p) => (
            <button
              key={p.id}
              className={`project-switcher-item${activeProject?.id === p.id ? ' active' : ''}`}
              onClick={() => { setActiveProject(p); setOpen(false); }}
            >
              {activeProject?.id === p.id && <span className="project-switcher-check">✓</span>}
              {p.name}
            </button>
          ))}
          {activeProject && (
            <>
              <div className="project-switcher-divider" />
              <button
                className="project-switcher-item project-switcher-clear"
                onClick={() => { setActiveProject(null); setOpen(false); }}
              >
                Clear selection
              </button>
            </>
          )}
          <div className="project-switcher-divider" />
          <button
            className="project-switcher-item project-switcher-manage"
            onClick={() => { setOpen(false); navigate('/projects'); }}
          >
            Manage projects →
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, username, profile, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  return (
    <nav className="topbar">
      <div className="nav-brand">
        <NavLink to="/">MOE Classifier</NavLink>
      </div>
      {isAuthenticated && <ProjectSwitcher />}
      <div className="nav-links">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        {isAuthenticated ? (
          <div className="nav-user-menu" ref={menuRef}>
            <button
              className="nav-user-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="User menu"
            >
              <AvatarCircle
                avatar={profile?.avatar}
                displayName={profile?.display_name}
                username={username}
              />
              <span className="nav-user-name">
                {profile?.display_name || username}
              </span>
              <span className="nav-chevron">{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <AvatarCircle
                    avatar={profile?.avatar}
                    displayName={profile?.display_name}
                    username={username}
                    size={40}
                  />
                  <div>
                    <div className="nav-dropdown-name">
                      {profile?.display_name || username}
                    </div>
                    <div className="nav-dropdown-username">@{username}</div>
                  </div>
                </div>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item" onClick={handleProfile}>
                  <span>&#9786;</span> Profile
                </button>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                  <span>&#10005;</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login">Sign In</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
