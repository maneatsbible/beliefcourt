import React from 'react';

export function ErrorPanel({ error, context }) {
  if (!error) return null;
  return (
    <div className="error-panel">
      <h3>Error: {context || 'An error occurred'}</h3>
      <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error.message || String(error)}</pre>
    </div>
  );
}
