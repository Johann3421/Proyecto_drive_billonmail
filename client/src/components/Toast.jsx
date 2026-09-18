import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
