export default function TemplateViewer({ templates }) {
  if (!templates) return <p className="dash-loading">Loading templates...</p>;
  return (
    <div className="template-viewer">
      {Object.entries(templates).map(([modelKey, template]) => (
        <div key={modelKey} className="template-block">
          <div className="template-model-name">{modelKey}</div>
          <pre className="template-content">{template}</pre>
        </div>
      ))}
    </div>
  );
}
