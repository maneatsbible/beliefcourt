import React, { useState } from 'react';

const MODES = ['claim', 'challenge', 'answer', 'offer', 'response'];

export function Composer({
  mode = 'claim',
  placeholder = 'What do you want to say?',
  onSubmit,
  onCancel,
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!MODES.includes(mode)) throw new Error(`Unknown composer mode: ${mode}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ mode, text: text.trim() });
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText('');
    setError(null);
    if (onCancel) onCancel();
  };

  return (
    <div className={`composer composer--${mode}`}>
      <form className="composer__form" onSubmit={handleSubmit} noValidate>
        <textarea
          className="composer__textarea"
          rows={4}
          placeholder={placeholder}
          aria-label={`Compose your ${mode}`}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={submitting}
        />
        <div className="composer__actions">
          <button type="button" className="btn btn--secondary composer__cancel-btn" onClick={handleCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary composer__submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
        {error && <p className="composer__error">{error}</p>}
      </form>
    </div>
  );
}
