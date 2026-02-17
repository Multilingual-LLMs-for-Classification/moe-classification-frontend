import { useConfig } from '../context/ConfigContext';
import ConfigHeader from '../components/config/ConfigHeader';
import KeyValueTable from '../components/config/KeyValueTable';
import EditableKeyValueTable from '../components/config/EditableKeyValueTable';

export default function BaseModelsPage() {
  const { registry, loading, error, editMode, handleSaveDefaultGeneration } = useConfig();

  if (loading) return <div className="page"><p className="dash-loading">Loading configuration...</p></div>;
  if (error) return <div className="page"><div className="error-msg">{error}</div></div>;
  if (!registry) return null;

  const { default_generation, base_models, tasks } = registry;
  const allLangs = new Set();
  Object.values(tasks).forEach(t => t.supported_languages?.forEach(l => allLangs.add(l)));

  return (
    <div className="page config-page">
      <ConfigHeader title="Base Models" description="View and manage LLM base models and default generation parameters." />

      {/* Overview cards */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card">
          <h3>Overview</h3>
          <div className="dash-items">
            <div className="dash-row"><span>Base Models</span><span>{Object.keys(base_models).length}</span></div>
            <div className="dash-row"><span>Tasks</span><span>{Object.keys(tasks).length}</span></div>
            <div className="dash-row"><span>Languages</span><span>{allLangs.size}</span></div>
          </div>
        </div>
        <div className="dash-card">
          <h3>Default Generation</h3>
          {editMode ? (
            <EditableKeyValueTable
              data={default_generation}
              editing={true}
              onSave={handleSaveDefaultGeneration}
            />
          ) : (
            <div className="dash-items">
              {Object.entries(default_generation).map(([k, v]) => (
                <div key={k} className="dash-row"><span>{k}</span><span>{String(v)}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Base Models grid */}
      <div className="base-models-grid">
        {Object.entries(base_models).map(([key, model]) => (
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
    </div>
  );
}
