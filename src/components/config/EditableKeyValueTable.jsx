import { useState, useEffect } from 'react';

/**
 * fieldConfig — optional map from display key to input descriptor:
 *   { type: 'text' | 'number' | 'boolean' | 'select', options?: string[], step?: number }
 *
 * 'boolean'  → Yes / No select
 * 'select'   → select from options[]
 * 'number'   → numeric input
 * 'text'     → plain text input (default)
 */
export default function EditableKeyValueTable({ data, title, editing, onSave, fieldConfig = {} }) {
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (data) setDraft({ ...data });
  }, [data, editing]);

  if (!data || typeof data !== 'object') return null;

  const handleChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const typed = {};
    for (const [k, v] of Object.entries(draft)) {
      const cfg = fieldConfig[k];
      if (cfg?.type === 'boolean') {
        typed[k] = v === 'Yes' || v === true;
      } else if (cfg?.type === 'number') {
        typed[k] = Number(v);
      } else {
        const original = data[k];
        if (typeof original === 'number') {
          typed[k] = Number(v);
        } else if (typeof original === 'boolean') {
          typed[k] = v === 'true' || v === true;
        } else {
          typed[k] = v;
        }
      }
    }
    onSave(typed);
  };

  const handleCancel = () => {
    setDraft({ ...data });
  };

  const renderInput = (k, v) => {
    const cfg = fieldConfig[k] || {};
    const currentVal = draft[k] !== undefined ? draft[k] : v;

    if (cfg.type === 'boolean') {
      return (
        <select
          className="kv-select"
          value={currentVal === true || currentVal === 'Yes' ? 'Yes' : 'No'}
          onChange={e => handleChange(k, e.target.value)}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    if (cfg.type === 'select') {
      return (
        <select
          className="kv-select"
          value={String(currentVal ?? '')}
          onChange={e => handleChange(k, e.target.value)}
        >
          {!cfg.options?.includes(String(currentVal ?? '')) && (
            <option value={String(currentVal ?? '')} disabled>
              {String(currentVal ?? '') || '— select —'}
            </option>
          )}
          {(cfg.options || []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (cfg.type === 'number') {
      return (
        <input
          type="number"
          className="kv-input"
          value={currentVal !== undefined ? String(currentVal) : ''}
          step={cfg.step ?? 1}
          onChange={e => handleChange(k, e.target.value)}
        />
      );
    }

    // default: text
    return (
      <input
        className="kv-input"
        value={currentVal !== undefined ? String(currentVal) : ''}
        onChange={e => handleChange(k, e.target.value)}
      />
    );
  };

  return (
    <div className="kv-table">
      {title && <h4 className="kv-title">{title}</h4>}
      <div className="kv-rows">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="kv-row">
            <span className="kv-key">{k}</span>
            {editing ? renderInput(k, v) : (
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
