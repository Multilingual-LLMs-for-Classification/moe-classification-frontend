import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.list();
      setProjects(data.projects || []);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const project = await projectsApi.create({ name: form.name.trim(), description: form.description.trim() || null });
      setProjects((prev) => [project, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
    } catch {
      setError('Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Failed to delete project.');
    }
  };

  return (
    <div className="page">
      <div className="analytics-header">
        <div>
          <h1>Projects</h1>
          <p className="page-desc">Organize classifications, analytics, and configurations per project.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create Project</h2>
            <form onSubmit={handleCreate} className="create-project-form">
              <label>
                Name <span className="required">*</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Finance Analytics"
                  required
                  autoFocus
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-msg">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-projects">
          <p>No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="project-card-header">
                <h3 className="project-card-name">{p.name}</h3>
                <button
                  className="btn-icon-danger"
                  title="Delete project"
                  onClick={(e) => handleDelete(e, p.id)}
                >
                  ✕
                </button>
              </div>
              {p.description && <p className="project-card-desc">{p.description}</p>}
              <div className="project-card-footer">
                <span className="project-card-date">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </span>
                <span className="project-card-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
