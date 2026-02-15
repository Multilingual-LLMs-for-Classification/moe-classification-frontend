import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <NavLink to="/">MOE Classifier</NavLink>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/classify">Classify</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <span className="nav-user">{username}</span>
            <button className="nav-logout" onClick={logout}>Logout</button>
          </>
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
