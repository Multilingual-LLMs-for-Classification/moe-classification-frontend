export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="result-card">
      <h3>Classification Result</h3>

      <div className="result-grid">
        <div className="result-item">
          <span className="result-label">Result</span>
          <span className="result-value result-main">{result.result}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Confidence</span>
          <span className="result-value">{result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Language</span>
          <span className="result-value">{result.language}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Domain</span>
          <span className="result-value">{result.domain}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Task</span>
          <span className="result-value">{result.task}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Processing Time</span>
          <span className="result-value">{result.processing_time_ms?.toFixed(1)} ms</span>
        </div>
      </div>

      <div className="result-routing">
        <span className="result-label">Routing Path</span>
        <span className="routing-path">{result.routing_path}</span>
      </div>

      {result.domain_probabilities && (
        <div className="result-probs">
          <span className="result-label">Domain Probabilities</span>
          <div className="prob-bars">
            {Object.entries(result.domain_probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([domain, prob]) => (
                <div key={domain} className="prob-row">
                  <span className="prob-name">{domain}</span>
                  <div className="prob-bar-bg">
                    <div className="prob-bar-fill" style={{ width: `${prob * 100}%` }} />
                  </div>
                  <span className="prob-pct">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {result.raw_response && (
        <div className="result-raw">
          <span className="result-label">Raw Response</span>
          <pre>{result.raw_response}</pre>
        </div>
      )}

      <div className="result-meta">
        Request ID: {result.request_id}
      </div>
    </div>
  );
}
