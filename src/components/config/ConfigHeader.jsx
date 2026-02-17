import { useConfig } from '../../context/ConfigContext';

export default function ConfigHeader({ title, description }) {
  const { editMode, setEditMode, banner, setBanner, reloading, handleReload } = useConfig();

  return (
    <>
      <div className="config-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="page-desc">{description}</p>}
        </div>
        <div className="config-header-actions">
          <button
            className={`btn-edit-mode ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
          {editMode && (
            <button className="btn-reload" onClick={handleReload} disabled={reloading}>
              {reloading ? 'Reloading...' : 'Reload System'}
            </button>
          )}
        </div>
      </div>

      {banner && (
        <div className={`config-banner ${banner.type}`}>
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)}>&times;</button>
        </div>
      )}
    </>
  );
}
