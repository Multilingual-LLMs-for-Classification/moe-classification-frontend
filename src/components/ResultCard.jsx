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
          <span className="result-label">Language</span>
          <span className="result-value">{result.language}</span>
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
        <span className="result-label">Routing Path </span>
        <span className="routing-path">{result.routing_path}</span>
      </div>


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
