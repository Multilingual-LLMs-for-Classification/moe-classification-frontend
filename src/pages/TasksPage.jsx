import { useConfig } from '../context/ConfigContext';
import ConfigHeader from '../components/config/ConfigHeader';
import CollapsibleSection from '../components/config/CollapsibleSection';
import KeyValueTable from '../components/config/KeyValueTable';
import EditableKeyValueTable from '../components/config/EditableKeyValueTable';
import EditableTemplateViewer from '../components/config/EditableTemplateViewer';
import TemplateViewer from '../components/config/TemplateViewer';
import LanguageMappingEditor from '../components/config/LanguageMappingEditor';

export default function TasksPage() {
  const {
    registry, templates, loading, error, editMode,
    loadTemplate, handleSaveTaskConfig, handleSaveGenOverrides,
    handleUpdateLangMapping, handleDeleteLangMapping, handleAddLangMapping,
    handleSaveTemplates,
  } = useConfig();

  if (loading) return <div className="page"><p className="dash-loading">Loading configuration...</p></div>;
  if (error) return <div className="page"><div className="error-msg">{error}</div></div>;
  if (!registry) return null;

  const { tasks } = registry;

  return (
    <div className="page config-page">
      <ConfigHeader title="Tasks" description="View and manage expert task configurations, language mappings, and prompt templates." />

      {Object.entries(tasks).map(([taskKey, task]) => (
        <CollapsibleSection key={taskKey} title={taskKey} badge={`${task.supported_languages.length} langs`}>
          {/* Task details */}
          {editMode ? (
            <EditableKeyValueTable
              title="Task Details"
              data={{
                'Base Model': task.base_model_key,
                'Adapter': task.adapter_name,
                'Adapter Path': task.adapter_path,
                'Expert Path': task.expert_path,
                'Strict Label Decoding': task.strict_label_decoding ? 'Yes' : 'No',
                ...(task.constrained_single_token != null ? { 'Constrained Single Token': task.constrained_single_token ? 'Yes' : 'No' } : {}),
              }}
              editing={true}
              onSave={(data) => handleSaveTaskConfig(taskKey, data)}
            />
          ) : (
            <KeyValueTable title="Task Details" data={{
              'Base Model': task.base_model_key,
              'Adapter': task.adapter_name,
              'Adapter Path': task.adapter_path,
              'Expert Path': task.expert_path,
              'Strict Label Decoding': task.strict_label_decoding ? 'Yes' : 'No',
              ...(task.constrained_single_token != null ? { 'Constrained Single Token': task.constrained_single_token ? 'Yes' : 'No' } : {}),
            }} />
          )}

          {/* Generation overrides */}
          {task.generation && (
            editMode ? (
              <EditableKeyValueTable
                title="Generation Overrides"
                data={task.generation}
                editing={true}
                onSave={(data) => handleSaveGenOverrides(taskKey, data)}
              />
            ) : (
              <KeyValueTable title="Generation Overrides" data={task.generation} />
            )
          )}

          {/* Label set */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 className="kv-title">Label Set ({task.label_set.length})</h4>
            <div className="tag-list">
              {task.label_set.map(label => (
                <span key={label} className="tag">{label}</span>
              ))}
            </div>
          </div>

          {/* Language mappings */}
          <CollapsibleSection title="Language Mappings" badge={Object.keys(task.language_mapping).length}>
            <LanguageMappingEditor
              mappings={task.language_mapping}
              editing={editMode}
              onUpdate={(lang, data) => handleUpdateLangMapping(taskKey, lang, data)}
              onDelete={(lang) => handleDeleteLangMapping(taskKey, lang)}
              onAdd={(lang, data) => handleAddLangMapping(taskKey, lang, data)}
            />
          </CollapsibleSection>

          {/* Prompt templates (lazy loaded) */}
          <CollapsibleSection title="Prompt Templates" onExpand={() => loadTemplate(taskKey)}>
            {editMode ? (
              <EditableTemplateViewer
                templates={templates[taskKey]}
                editing={true}
                onSave={(data) => handleSaveTemplates(taskKey, data)}
              />
            ) : (
              <TemplateViewer templates={templates[taskKey]} />
            )}
          </CollapsibleSection>
        </CollapsibleSection>
      ))}
    </div>
  );
}
