import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import ClassifyForm from '../components/ClassifyForm';
import ResultCard from '../components/ResultCard';
import { useActiveProject } from '../context/ActiveProjectContext';
import { projectsApi } from '../api/projects';

// ── Expert Override Panel ──────────────────────────────────────────────────────

function ExpertOverridePanel({ activeProject, override, onChange }) {
  const [taskConfigs, setTaskConfigs] = useState([]);

  useEffect(() => {
    if (activeProject) {
      projectsApi.listTaskConfigs(activeProject.id)
        .then(setTaskConfigs)
        .catch(() => setTaskConfigs([]));
    } else {
      projectsApi.getSystemDefaults()
        .then((defaults) => {
          const tasks = defaults?.tasks || {};
          const configs = Object.entries(tasks).map(([task_key, cfg]) => ({
            task_key,
            language_mapping: cfg.language_mapping || {},
            supported_languages: cfg.supported_languages || [],
          }));
          setTaskConfigs(configs);
        })
        .catch(() => setTaskConfigs([]));
    }
  }, [activeProject]);

  const selectedTask = taskConfigs.find((t) => t.task_key === override.task) || null;
  const langMap = selectedTask?.language_mapping || {};

  // Build ordered list of { language, adapter_name, base_model_key } from language_mapping
  const expertOptions = Object.entries(langMap).map(([lang, cfg]) => ({
    language: lang,
    adapter_name: cfg.adapter_name || '—',
    base_model_key: cfg.base_model_key || '—',
  }));

  // Derived: adapter for currently selected language
  const currentAdapter = override.language
    ? (langMap[override.language]?.adapter_name || '')
    : '';

  const handleTaskChange = (task) => {
    onChange({ task, language: '', adapter: '' });
  };

  // Selecting a language auto-syncs the adapter
  const handleLanguageChange = (language) => {
    const adapter = language ? (langMap[language]?.adapter_name || '') : '';
    onChange({ ...override, language, adapter });
  };

  // Selecting an adapter auto-syncs the language
  const handleAdapterChange = (adapter_name) => {
    const entry = expertOptions.find((o) => o.adapter_name === adapter_name);
    const language = entry ? entry.language : '';
    onChange({ ...override, language, adapter: adapter_name });
  };

  const isActive = override.task && override.language && override.adapter;

  return (
    <div className="expert-override-panel">
      <div className="expert-override-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Task</label>
          <select
            value={override.task}
            onChange={(e) => handleTaskChange(e.target.value)}
          >
            <option value="">— Select task —</option>
            {taskConfigs.map((t) => (
              <option key={t.task_key} value={t.task_key}>{t.task_key}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Language</label>
          <select
            value={override.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={!override.task}
          >
            <option value="">— Select language —</option>
            {expertOptions.map(({ language, adapter_name }) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Adapter</label>
          <select
            value={override.adapter || currentAdapter}
            onChange={(e) => handleAdapterChange(e.target.value)}
            disabled={!override.task}
          >
            <option value="">— Select adapter —</option>
            {expertOptions.map(({ language, adapter_name, base_model_key }) => (
              <option key={adapter_name} value={adapter_name}>
                {adapter_name} ({language})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info row: show base model for selected expert */}
      {override.language && langMap[override.language] && (
        <div className="expert-override-info">
          <span>Base model:</span>
          <strong>{langMap[override.language].base_model_key || '—'}</strong>
          <span style={{ marginLeft: '1.5rem' }}>Adapter path:</span>
          <span className="mono-sm">{langMap[override.language].adapter_path || '—'}</span>
        </div>
      )}

      {isActive && (
        <div className="expert-override-active">
          Forcing: <strong>{override.task}</strong> / <strong>{override.language}</strong> / <strong>{override.adapter}</strong>
          <button
            className="btn-clear-override"
            onClick={() => onChange({ task: '', language: '', adapter: '' })}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ClassifyPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [override, setOverride] = useState({ task: '', language: '', adapter: '' });
  const { activeProject } = useActiveProject();
  const navigate = useNavigate();

  const handleClassify = async (payload) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const body = { ...payload };
      if (activeProject) body.project_id = activeProject.id;
      if (showOverride && override.task && override.language) {
        body.force_task = override.task;
        body.force_language = override.language;
      }
      // Note: adapter selection is coupled to language via language_mapping;
      // force_language already resolves to the correct adapter on the backend.
      const res = await client.post('/api/v1/classify', body);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  const isOverrideActive = showOverride && override.task && override.language && override.adapter;

  return (
    <div className="page classify-page">
      <div className="classify-page-header">
        <div>
          <h1>Text Classification</h1>
          <p className="page-desc">Submit text to the MOE routing system for classification.</p>
        </div>
        {activeProject ? (
          <div className="classify-project-badge">
            <span className="classify-project-dot" />
            <span className="classify-project-label">
              Project: <strong>{activeProject.name}</strong>
            </span>
            <button
              className="classify-project-config-link"
              onClick={() => navigate(`/projects/${activeProject.id}/config`)}
            >
              Config
            </button>
          </div>
        ) : (
          <div className="classify-project-badge classify-project-none">
            No project selected — using global config
          </div>
        )}
      </div>

      {/* Expert Override Toggle */}
      <div className="expert-override-toggle-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showOverride}
            onChange={(e) => {
              setShowOverride(e.target.checked);
              if (!e.target.checked) setOverride({ task: '', language: '', adapter: '' });
            }}
          />
          <span>Force expert (bypass auto-routing)</span>
        </label>
        {isOverrideActive && (
          <span className="override-active-badge">Override active</span>
        )}
      </div>

      {showOverride && (
        <ExpertOverridePanel
          activeProject={activeProject}
          override={override}
          onChange={setOverride}
        />
      )}

      <div className="classify-layout">
        <div className="classify-left">
          <ClassifyForm onSubmit={handleClassify} loading={loading} />
        </div>
        <div className="classify-right">
          {error && <div className="error-msg">{error}</div>}
          {loading && <div className="loading-msg">Processing through MOE pipeline...</div>}
          <ResultCard result={result} />
          {!result && !loading && !error && (
            <div className="placeholder-msg">
              Submit a text to see classification results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
