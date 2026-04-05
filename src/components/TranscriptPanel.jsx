import React, { useEffect, useRef } from 'react';

export default function TranscriptPanel({ segments, interimText }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, interimText]);

  return (
    <div className="panel panel-english">
      <div className="panel-header">
        <span className="panel-flag">🇺🇸</span>
        <h2>English</h2>
      </div>
      <div className="panel-body">
        {segments.length === 0 && !interimText && (
          <p className="placeholder">English transcript will appear here…</p>
        )}
        {segments.map((seg) => (
          <p key={seg.id} className="segment-text segment-final">
            {seg.english}
          </p>
        ))}
        {interimText && (
          <p className="segment-text segment-interim">{interimText}</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
