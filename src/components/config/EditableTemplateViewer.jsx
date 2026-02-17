import { useState, useEffect } from 'react';

export default function EditableTemplateViewer({ templates, editing, onSave }) {
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (templates) setDraft({ ...templates });
  }, [templates, editing]);

  if (!templates) return <p className="dash-loading">Loading templates...</p>;

  const handleChange = (modelKey, value) => {
    setDraft(prev => ({ ...prev, [modelKey]: value }));
  };

  const handleSave = () => {
    onSave(draft);
  };

  const handleCancel = () => {
    setDraft({ ...templates });
  };

  return (
    <div className="template-viewer">
      {Object.entries(editing ? draft : templates).map(([modelKey, template]) => (
        <div key={modelKey} className="template-block">
          <div className="template-model-name">{modelKey}</div>
          {editing ? (
            <textarea
              className="template-textarea"
              value={template}
              onChange={e => handleChange(modelKey, e.target.value)}
              rows={8}
            />
          ) : (
            <pre className="template-content">{template}</pre>
          )}
        </div>
      ))}
      {editing && (
        <div className="edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
