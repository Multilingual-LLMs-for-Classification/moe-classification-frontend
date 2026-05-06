import { useState, useCallback } from 'react';
import { ProjectConfigProvider, useProjectConfig } from '../context/ProjectConfigContext';
import CollapsibleSection from '../components/config/CollapsibleSection';
import KeyValueTable from '../components/config/KeyValueTable';
import EditableKeyValueTable from '../components/config/EditableKeyValueTable';
import LanguageMappingEditor from '../components/config/LanguageMappingEditor';

export default function ProjectConfigPage() {
  return (
    <ProjectConfigProvider>
      <ProjectConfigPageInner />
    </ProjectConfigProvider>
  );
}

const CONFIG_TABS = ['Base Models', 'Tasks'];

function ProjectConfigPageInner() {
  const {
    registry, loading, error, editMode, setEditMode, banner, setBanner,
    handleResetAllToDefaults, handleSaveAsDefault,
  } = useProjectConfig();

  const [activeTab, setActiveTab] = useState('Base Models');
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmSaveDefault, setConfirmSaveDefault] = useState(false);

  const doResetAll = useCallback(async () => {
    setConfirmResetAll(false);
    await handleResetAllToDefaults();
  }, [handleResetAllToDefaults]);

  const doSaveAsDefault = useCallback(async () => {
    setConfirmSaveDefault(false);
    await handleSaveAsDefault();
  }, [handleSaveAsDefault]);

if (loading) return <div className="project-section"><div className="loading-msg">Loading configuration...</div></div>;
  if (error) return <div className="project-section"><div className="error-msg">{error}</div></div>;
  if (!registry) return null;

  return (
    <div className="project-section config-page">
      {/* Header */}
      <div className="config-header">
        <div>
          <h2>Project Configuration</h2>
          <p className="page-desc">
            All changes are saved directly to the database and used for inference on this project.
          </p>
        </div>
        <div className="config-header-actions">
          {confirmSaveDefault ? (
            <div className="reset-confirm-inline">
              <span>Save this project's config as the new system default?</span>
              <button className="btn-save-default-confirm" onClick={doSaveAsDefault}>Confirm</button>
              <button className="btn-cancel-sm" onClick={() => setConfirmSaveDefault(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-save-default" onClick={() => setConfirmSaveDefault(true)}>
              Save as Default
            </button>
          )}
          {confirmResetAll ? (
            <div className="reset-confirm-inline">
              <span>Reset all to system default?</span>
              <button className="btn-danger-sm" onClick={doResetAll}>Confirm</button>
              <button className="btn-cancel-sm" onClick={() => setConfirmResetAll(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-reset-defaults" onClick={() => setConfirmResetAll(true)}>
              Reset to Defaults
            </button>
          )}
          <button
            className={`btn-edit-mode ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`config-banner ${banner.type}`}>
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)}>&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="analytics-tabs" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab}
            className={`analytics-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Base Models' && <BaseModelsTab />}
      {activeTab === 'Tasks' && <TasksTab />}
    </div>
  );
}

// ── Base Models Tab ──

const GEN_FIELD_CONFIG = {
  max_new_tokens:     { type: 'number', step: 1 },
  temperature:        { type: 'number', step: 0.01 },
  top_p:              { type: 'number', step: 0.01 },
  repetition_penalty: { type: 'number', step: 0.01 },
  do_sample:          { type: 'boolean' },
};

function BaseModelsTab() {
  const { registry, editMode, handleSaveDefaultGeneration } = useProjectConfig();
  const { default_generation, base_models, tasks } = registry;

  const allLangs = new Set();
  Object.values(tasks || {}).forEach((t) => t.supported_languages?.forEach((l) => allLangs.add(l)));

  return (
    <>
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Overview */}
        <div className="dash-card">
          <h3>Overview</h3>
          <div className="dash-items">
            <div className="dash-row"><span>Base Models</span><span>{Object.keys(base_models || {}).length}</span></div>
            <div className="dash-row"><span>Tasks</span><span>{Object.keys(tasks || {}).length}</span></div>
            <div className="dash-row"><span>Languages</span><span>{allLangs.size}</span></div>
          </div>
          <p className="page-desc" style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>
            Changes to Base Models and Default Generation are saved to this project's database config and applied at inference time.
          </p>
        </div>

        {/* Default Generation */}
        <div className="dash-card">
          <h3>Default Generation</h3>
          {editMode ? (
            <EditableKeyValueTable
              data={default_generation}
              editing={true}
              onSave={handleSaveDefaultGeneration}
              fieldConfig={GEN_FIELD_CONFIG}
            />
          ) : (
            <div className="dash-items">
              {Object.entries(default_generation || {}).map(([k, v]) => (
                <div key={k} className="dash-row"><span>{k}</span><span>{String(v)}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Base Models grid */}
      <div className="base-models-grid">
        {Object.entries(base_models || {}).map(([key, model]) => (
          <div key={key} className="base-model-card">
            <h4>{key}</h4>
            <KeyValueTable data={{
              'HuggingFace': model.hf_name,
              '4-bit': model.load_in_4bit ? 'Yes' : 'No',
              'Device Map': model.device_map,
            }} />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Tasks Tab ──

function TasksTab() {
  const { tasks } = useProjectConfig();
  const [selectedKey, setSelectedKey] = useState(null);

  // Auto-select first task
  const effectiveKey = selectedKey ?? (tasks.length > 0 ? tasks[0].task_key : null);

  if (tasks.length === 0) {
    return <div className="empty-msg">No tasks configured for this project.</div>;
  }

  const selectedTask = tasks.find((t) => t.task_key === effectiveKey) ?? null;

  return (
    <div className="task-config-layout">
      {/* Left: task list */}
      <div className="task-list-panel">
        <h3 className="panel-title">Tasks <span className="badge">{tasks.length}</span></h3>
        {tasks.map((t) => (
          <button
            key={t.task_key}
            className={`task-list-item${effectiveKey === t.task_key ? ' active' : ''}`}
            onClick={() => setSelectedKey(t.task_key)}
          >
            <span className="task-list-key">{t.task_key}</span>
            <span className="task-list-meta">
              {t.adapter_name || t.base_model_key || '—'}
            </span>
            <span className="task-list-langs">
              {(t.supported_languages || []).length} lang{(t.supported_languages || []).length !== 1 ? 's' : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Right: task detail */}
      <div className="task-detail-panel">
        {selectedTask ? (
          <TaskDetail task={selectedTask} />
        ) : (
          <div className="empty-msg">Select a task to view its configuration.</div>
        )}
      </div>
    </div>
  );
}

// ── Task Detail ──

function TaskDetail({ task }) {
  const {
    registry, editMode,
    handleSaveTaskConfig, handleSaveGenOverrides,
    handleUpdateLangMapping, handleDeleteLangMapping, handleAddLangMapping,
    handleResetTaskToDefault,
  } = useProjectConfig();

  const [confirmReset, setConfirmReset] = useState(false);

  const taskKey = task.task_key;
  const baseModelOptions = Object.keys(registry?.base_models || {});

  const taskFieldConfig = {
    'Base Model':              { type: 'select', options: baseModelOptions },
    'Strict Label Decoding':   { type: 'boolean' },
    'Constrained Single Token':{ type: 'boolean' },
  };

  const taskData = {
    'Base Model': task.base_model_key,
    'Adapter': task.adapter_name,
    'Adapter Path': task.adapter_path,
    'Expert Path': task.expert_path,
    'Template Path': task.template_path,
    'Strict Label Decoding': task.strict_label_decoding ? 'Yes' : 'No',
    ...(task.constrained_single_token != null
      ? { 'Constrained Single Token': task.constrained_single_token ? 'Yes' : 'No' }
      : {}),
  };

  const doReset = async () => {
    setConfirmReset(false);
    await handleResetTaskToDefault(taskKey);
  };

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h3>{taskKey}</h3>
        <div className="task-detail-header-actions">
          {task.updated_at && (
            <span className="task-updated">
              Updated {new Date(task.updated_at).toLocaleDateString()}
            </span>
          )}
          {confirmReset ? (
            <>
              <span className="reset-confirm-text">Reset this task?</span>
              <button className="btn-danger-sm" onClick={doReset}>Confirm</button>
              <button className="btn-cancel-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn-reset-sm" onClick={() => setConfirmReset(true)}>
              Reset to Default
            </button>
          )}
        </div>
      </div>

      {/* Task Details */}
      {editMode ? (
        <EditableKeyValueTable
          title="Task Details"
          data={taskData}
          editing={true}
          fieldConfig={taskFieldConfig}
          onSave={(data) => handleSaveTaskConfig(taskKey, data)}
        />
      ) : (
        <KeyValueTable title="Task Details" data={taskData} />
      )}

      {/* Generation Overrides */}
      {task.generation && (
        editMode ? (
          <EditableKeyValueTable
            title="Generation Overrides"
            data={task.generation}
            editing={true}
            fieldConfig={GEN_FIELD_CONFIG}
            onSave={(data) => handleSaveGenOverrides(taskKey, data)}
          />
        ) : (
          <KeyValueTable title="Generation Overrides" data={task.generation} />
        )
      )}

      {/* Label Set */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 className="kv-title">Label Set ({task.label_set?.length ?? 0})</h4>
        <div className="tag-list">
          {(task.label_set || []).map((label) => (
            <span key={label} className="tag">{label}</span>
          ))}
        </div>
      </div>

      {/* Language Mappings */}
      <CollapsibleSection
        title="Language Mappings"
        badge={Object.keys(task.language_mapping || {}).length}
      >
        <LanguageMappingEditor
          mappings={task.language_mapping || {}}
          editing={editMode}
          baseModelOptions={baseModelOptions}
          onUpdate={(lang, data) => handleUpdateLangMapping(taskKey, lang, data)}
          onDelete={(lang) => handleDeleteLangMapping(taskKey, lang)}
          onAdd={(lang, data) => handleAddLangMapping(taskKey, lang, data)}
        />
      </CollapsibleSection>
    </div>
  );
}
