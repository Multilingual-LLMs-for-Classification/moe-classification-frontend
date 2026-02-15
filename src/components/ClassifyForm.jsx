import { useState } from 'react';

const PROMPT_TEMPLATES = [
  { label: 'Sentiment Analysis (1-5)', value: 'Rate this product review from 1 to 5 stars based on sentiment.' },
  { label: 'PII Extraction', value: 'Extract all personally identifiable information (PII) from the following text.' },
  { label: 'News Classification', value: 'Classify the following news article into its appropriate category.' },
  { label: 'Product Relevance (ESCI)', value: 'Rate the relevance of this product to the given query.' },
  { label: 'Custom', value: '' },
];

export default function ClassifyForm({ onSubmit, loading }) {
  const [promptTemplate, setPromptTemplate] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [returnProbs, setReturnProbs] = useState(false);
  const [returnRaw, setReturnRaw] = useState(false);

  const handleTemplateChange = (e) => {
    setPromptTemplate(Number(e.target.value));
    setCustomPrompt('');
  };

  const getPrompt = () => {
    if (PROMPT_TEMPLATES[promptTemplate].label === 'Custom') return customPrompt;
    return PROMPT_TEMPLATES[promptTemplate].value;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      prompt: getPrompt(),
      input_data: {
        text,
        ...(title ? { title } : {}),
      },
      options: {
        return_probabilities: returnProbs,
        return_raw_response: returnRaw,
      },
    });
  };

  return (
    <form className="classify-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Prompt</label>
        <select value={promptTemplate} onChange={handleTemplateChange}>
          {PROMPT_TEMPLATES.map((t, i) => (
            <option key={i} value={i}>{t.label}</option>
          ))}
        </select>
        {PROMPT_TEMPLATES[promptTemplate].label === 'Custom' && (
          <textarea
            placeholder="Enter your custom classification prompt..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            required
            rows={2}
          />
        )}
      </div>

      <div className="form-group">
        <label>Text to Classify *</label>
        <textarea
          placeholder="Enter the text you want to classify..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={5}
        />
      </div>

      <div className="form-group">
        <label>Title (optional)</label>
        <input
          type="text"
          placeholder="Optional title or header"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

      <button type="submit" disabled={loading || !text.trim()}>
        {loading ? 'Classifying...' : 'Classify'}
      </button>
    </form>
  );
}
