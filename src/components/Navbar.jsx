import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <nav className="topbar">
      <div className="nav-brand">
        <NavLink to="/">MOE Classifier</NavLink>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
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
