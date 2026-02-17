import { useState } from 'react';

export default function LanguageMappingEditor({ mappings, editing, onUpdate, onDelete, onAdd }) {
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

  const fields = ['base_model_key', 'adapter_name', 'adapter_path'];

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
                    <span className="kv-key">{field}</span>
                    <input
                      className="kv-input"
                      value={editDrafts[lang][field] || ''}
                      onChange={e => handleFieldChange(lang, field, e.target.value)}
                    />
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
                    <span className="kv-key">{field}</span>
                    <span className="kv-value">{mapping[field] || ''}</span>
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
                <span className="kv-key">Language Code</span>
                <input
                  className="kv-input"
                  value={newLang}
                  onChange={e => setNewLang(e.target.value)}
                  placeholder="e.g. fr, de, ja"
                />
              </div>
              {fields.map(field => (
                <div key={field} className="kv-row">
                  <span className="kv-key">{field}</span>
                  <input
                    className="kv-input"
                    value={newMapping[field]}
                    onChange={e => setNewMapping(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="edit-actions">
              <button className="btn-save" onClick={handleAdd} disabled={!newLang.trim()}>Add Mapping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
