import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects';
import { useAuth } from './AuthContext';

const ActiveProjectContext = createContext(null);

const STORAGE_KEY = 'activeProjectId';

export function ActiveProjectProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectIdState] = useState(
    () => localStorage.getItem(STORAGE_KEY) ? Number(localStorage.getItem(STORAGE_KEY)) : null
  );
  const [loading, setLoading] = useState(false);

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }
    setLoading(true);
    try {
      const res = await projectsApi.list();
      const data = Array.isArray(res) ? res : (res.projects ?? []);
      setProjects(data);
      // If saved active project no longer exists, clear it
      if (activeProjectId && !data.find((p) => p.id === activeProjectId)) {
        setActiveProjectIdState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refreshProjects(); }, [refreshProjects]);

  const setActiveProject = (project) => {
    if (project) {
      setActiveProjectIdState(project.id);
      localStorage.setItem(STORAGE_KEY, String(project.id));
    } else {
      setActiveProjectIdState(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  return (
    <ActiveProjectContext.Provider value={{
      projects,
      activeProject,
      activeProjectId,
      setActiveProject,
      refreshProjects,
      loading,
    }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject() {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used within ActiveProjectProvider');
  return ctx;
}
