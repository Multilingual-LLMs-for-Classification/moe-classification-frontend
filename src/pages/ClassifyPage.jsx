import { useState } from 'react';
import client from '../api/client';
import ClassifyForm from '../components/ClassifyForm';
import ResultCard from '../components/ResultCard';

export default function ClassifyPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClassify = async (payload) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await client.post('/api/v1/classify', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page classify-page">
      <h1>Text Classification</h1>
      <p className="page-desc">Submit text to the MOE routing system for classification.</p>

      <div className="classify-layout">
        <div className="classify-left">
          <ClassifyForm onSubmit={handleClassify} loading={loading} />
        </div>
        <div className="classify-right">
          {error && <div className="error-msg">{error}</div>}
          {loading && <div className="loading-msg">Processing through MOE pipeline...</div>}
          <ResultCard result={result} />
          {!result && !loading && !error && (
            <div className="placeholder-msg">
              Submit a text to see classification results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
