import React from 'react';

export function Notification({ message, type = 'info', onClose }) {
  if (!message) return null;
  return (
    <div className={`notification notification--${type}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ marginLeft: 8 }}>×</button>}
    </div>
  );
}
