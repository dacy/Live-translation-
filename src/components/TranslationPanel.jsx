import React, { useEffect, useRef } from 'react';

export default function TranslationPanel({ segments, isSpeaking, pendingCount }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  return (
    <div className="panel panel-chinese">
      <div className="panel-header">
        <span className="panel-flag">🇨🇳</span>
        <h2>中文 {isSpeaking && <span className="speaking-badge">🔊 播放中</span>}</h2>
      </div>
      <div className="panel-body">
        {segments.length === 0 && pendingCount === 0 && (
          <p className="placeholder">Chinese translation will appear here…</p>
        )}
        {segments.map((seg) => (
          <p key={seg.id} className="segment-text segment-final chinese-text">
            {seg.chinese}
          </p>
        ))}
        {pendingCount > 0 && (
          <p className="segment-text segment-interim">
            <span className="translating-dots">
              <span>·</span><span>·</span><span>·</span>
            </span>
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
