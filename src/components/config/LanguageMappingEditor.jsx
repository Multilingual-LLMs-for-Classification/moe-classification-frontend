import { useState } from 'react';

const LANG_OPTIONS = [
  'english', 'german', 'french', 'spanish', 'italian', 'portuguese',
  'dutch', 'polish', 'russian', 'japanese', 'chinese', 'korean',
  'arabic', 'turkish', 'swedish', 'danish', 'norwegian', 'finnish',
];

export default function LanguageMappingEditor({ mappings, editing, onUpdate, onDelete, onAdd, baseModelOptions = [] }) {
  const [newLang, setNewLang] = useState('');
  const [newMapping, setNewMapping] = useState({ base_model_key: '', adapter_name: '', adapter_path: '' });
  const [editDrafts, setEditDrafts] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const startEdit = (lang, mapping) => {
    setEditDrafts(prev => ({ ...prev, [lang]: { ...mapping } }));
  };

  const cancelEdit = (lang) => {
    setEditDrafts(prev => {
      const next = { ...prev };
      delete next[lang];
      return next;
    });
  };

  const handleFieldChange = (lang, field, value) => {
    setEditDrafts(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleSave = (lang) => {
    onUpdate(lang, editDrafts[lang]);
    cancelEdit(lang);
  };

  const handleDelete = (lang) => {
    onDelete(lang);
    setConfirmDelete(null);
  };

  const handleAdd = () => {
    if (!newLang.trim()) return;
    onAdd(newLang.trim(), newMapping);
    setNewLang('');
    setNewMapping({ base_model_key: '', adapter_name: '', adapter_path: '' });
  };

  const renderMappingField = (field, value, onChange) => {
    if (field === 'base_model_key' && baseModelOptions.length > 0) {
      return (
        <select
          className="kv-select"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        >
          {(!value || !baseModelOptions.includes(value)) && (
            <option value="" disabled>{value || '— select base model —'}</option>
          )}
          {baseModelOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        className="kv-input"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field === 'adapter_name' ? 'adapter name' : field === 'adapter_path' ? '/path/to/adapter' : ''}
      />
    );
  };

  const fields = ['base_model_key', 'adapter_name', 'adapter_path'];
  const fieldLabels = {
    base_model_key: 'Base Model',
    adapter_name: 'Adapter',
    adapter_path: 'Adapter Path',
  };

  return (
    <div className="lang-mapping-editor">
      {Object.entries(mappings).map(([lang, mapping]) => (
        <div key={lang} className="lang-mapping-item">
          <div className="lang-mapping-header">
            <h4 className="kv-title">{lang}</h4>
            {editing && !editDrafts[lang] && (
              <div className="lang-mapping-actions">
                <button className="btn-edit-sm" onClick={() => startEdit(lang, mapping)}>Edit</button>
                {confirmDelete === lang ? (
                  <>
                    <button className="btn-delete-confirm" onClick={() => handleDelete(lang)}>Confirm</button>
                    <button className="btn-cancel-sm" onClick={() => setConfirmDelete(null)}>No</button>
                  </>
                ) : (
                  <button className="btn-delete-sm" onClick={() => setConfirmDelete(lang)}>Delete</button>
                )}
              </div>
            )}
          </div>
          {editDrafts[lang] ? (
            <div className="kv-table">
              <div className="kv-rows">
                {fields.map(field => (
                  <div key={field} className="kv-row">
                    <span className="kv-key">{fieldLabels[field] || field}</span>
                    {renderMappingField(
                      field,
                      editDrafts[lang][field],
                      (val) => handleFieldChange(lang, field, val),
                    )}
                  </div>
                ))}
              </div>
              <div className="edit-actions">
                <button className="btn-save" onClick={() => handleSave(lang)}>Save</button>
                <button className="btn-cancel" onClick={() => cancelEdit(lang)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="kv-table">
              <div className="kv-rows">
                {fields.map(field => (
                  <div key={field} className="kv-row">
                    <span className="kv-key">{fieldLabels[field] || field}</span>
                    <span className="kv-value">{mapping[field] || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {editing && (
        <div className="lang-mapping-add">
          <h4 className="kv-title">Add Language Mapping</h4>
          <div className="kv-table">
            <div className="kv-rows">
              <div className="kv-row">
                <span className="kv-key">Language</span>
                <select
                  className="kv-select"
                  value={newLang}
                  onChange={e => setNewLang(e.target.value)}
                >
                  <option value="" disabled>— select language —</option>
                  {LANG_OPTIONS.filter(l => !mappings[l]).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                  <option value="__custom__">other (type below)</option>
                </select>
              </div>
              {newLang === '__custom__' && (
                <div className="kv-row">
                  <span className="kv-key">Custom Code</span>
                  <input
                    className="kv-input"
                    placeholder="e.g. hindi"
                    onChange={e => setNewLang(e.target.value === '' ? '__custom__' : e.target.value)}
                  />
                </div>
              )}
              {fields.map(field => (
                <div key={field} className="kv-row">
                  <span className="kv-key">{fieldLabels[field] || field}</span>
                  {renderMappingField(
                    field,
                    newMapping[field],
                    (val) => setNewMapping(prev => ({ ...prev, [field]: val })),
                  )}
                </div>
              ))}
            </div>
            <div className="edit-actions">
              <button
                className="btn-save"
                onClick={handleAdd}
                disabled={!newLang.trim() || newLang === '__custom__'}
              >
                Add Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
