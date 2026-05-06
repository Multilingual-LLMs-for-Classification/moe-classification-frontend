import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { ProjectProvider } from '../context/ProjectContext';

export default function ProjectLayout() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    projectsApi.get(projectId)
      .then(setProject)
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="page"><div className="loading-msg">Loading project...</div></div>;
  if (!project) return null;

  const base = `/projects/${projectId}`;

  return (
    <ProjectProvider project={project}>
      <div className="page project-layout">
        {/* Project header */}
        <div className="project-layout-header">
          <button className="btn-back" onClick={() => navigate('/projects')}>← Projects</button>
          <div>
            <h1 className="project-layout-title">{project.name}</h1>
            {project.description && <p className="page-desc">{project.description}</p>}
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="project-subnav">
          <NavLink to={`${base}/analytics`} className={({ isActive }) => `project-subnav-tab${isActive ? ' active' : ''}`}>
            Analytics
          </NavLink>
          <NavLink to={`${base}/config`} className={({ isActive }) => `project-subnav-tab${isActive ? ' active' : ''}`}>
            Configuration
          </NavLink>
        </div>

        <Outlet />
      </div>
    </ProjectProvider>
  );
}
