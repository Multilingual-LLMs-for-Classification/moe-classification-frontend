import { useState, useEffect } from 'react';

export default function EditableKeyValueTable({ data, title, editing, onSave }) {
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (data) setDraft({ ...data });
  }, [data, editing]);

  if (!data || typeof data !== 'object') return null;

  const handleChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Try to preserve types: numbers stay numbers, booleans stay booleans
    const typed = {};
    for (const [k, v] of Object.entries(draft)) {
      const original = data[k];
      if (typeof original === 'number') {
        typed[k] = Number(v);
      } else if (typeof original === 'boolean') {
        typed[k] = v === 'true' || v === true;
      } else {
        typed[k] = v;
      }
    }
    onSave(typed);
  };

  const handleCancel = () => {
    setDraft({ ...data });
  };

  return (
    <div className="kv-table">
      {title && <h4 className="kv-title">{title}</h4>}
      <div className="kv-rows">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="kv-row">
            <span className="kv-key">{k}</span>
            {editing ? (
              <input
                className="kv-input"
                value={draft[k] !== undefined ? String(draft[k]) : ''}
                onChange={e => handleChange(k, e.target.value)}
              />
            ) : (
              <span className="kv-value">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
