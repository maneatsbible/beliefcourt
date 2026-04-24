import React from 'react';

export function RecordCard({ record, perms, user, onOpen }) {
  return (
    <div className="record-card" data-record-id={record.id}>
      <div className="record-card__content">
        <div className="record-card__text">{record.text}</div>
        <div className="record-card__meta">
          <span className="record-card__author">{record.author}</span>
        </div>
      </div>
      <div className="record-card__actions">
        {perms.canChallenge && (
          <button data-action="challenge" onClick={() => onOpen(record)}>
            Challenge
          </button>
        )}
        {perms.canAgree && (
          <button data-action="agree" onClick={() => onOpen(record)}>
            Agree
          </button>
        )}
      </div>
    </div>
  );
}
