export default function KeyValueTable({ data, title }) {
  if (!data || typeof data !== 'object') return null;
  return (
    <div className="kv-table">
      {title && <h4 className="kv-title">{title}</h4>}
      <div className="kv-rows">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="kv-row">
            <span className="kv-key">{k}</span>
            <span className="kv-value">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
