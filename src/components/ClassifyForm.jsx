import { useState } from 'react';

export default function ClassifyForm({ onSubmit, loading }) {
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [returnProbs, setReturnProbs] = useState(false);
  const [returnRaw, setReturnRaw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      description,
      text,
      options: {
        return_probabilities: returnProbs,
        return_raw_response: returnRaw,
      },
    });
  };

  return (
    <form className="classify-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Description *</label>
        <textarea
          placeholder="Describe what you want to do with the text, e.g. 'Rate this review from 1 to 5 stars based on sentiment'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Classification Text *</label>
        <textarea
          placeholder="Enter the text you want to classify..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={5}
        />
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" checked={returnProbs} onChange={(e) => setReturnProbs(e.target.checked)} />
          Return domain probabilities
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={returnRaw} onChange={(e) => setReturnRaw(e.target.checked)} />
          Return raw response
        </label>
      </div>

      <button type="submit" disabled={loading || !text.trim() || !description.trim()}>
        {loading ? 'Classifying...' : 'Classify'}
      </button>
    </form>
  );
}
