import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  // Load profile whenever we have a token
  const refreshProfile = useCallback(() => {
    if (!token) { setProfile(null); return; }
    authApi.getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [token]);

  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  const register = async (user, password) => {
    const res = await client.post('/api/v1/auth/register', { username: user, password });
    return res.data;
  };

  const login = async (user, password) => {
    const params = new URLSearchParams();
    params.append('username', user);
    params.append('password', password);
    const res = await client.post('/api/v1/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    setToken(res.data.access_token);
    setUsername(user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    const updated = await authApi.updateProfile(data);
    setProfile(updated);
    return updated;
  };

  const updateAvatar = async (avatarDataUrl) => {
    const updated = await authApi.updateAvatar(avatarDataUrl);
    setProfile(updated);
    return updated;
  };

  const removeAvatar = async () => {
    const updated = await authApi.deleteAvatar();
    setProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      token, username, isAuthenticated: !!token,
      profile, refreshProfile,
      login, logout, register,
      updateProfile, updateAvatar, removeAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
