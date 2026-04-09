import React from 'react';

export default function Controls({ isListening, isTranslating, isSpeaking, onStart, onStop, isSupported, error }) {
  const getStatus = () => {
    if (!isSupported) return { label: 'Not Supported', cls: 'status-error' };
    if (isSpeaking) return { label: '🔊 Speaking', cls: 'status-speaking' };
    if (isTranslating) return { label: '⏳ Translating', cls: 'status-translating' };
    if (isListening) return { label: '🎙 Listening', cls: 'status-listening' };
    return { label: 'Idle', cls: 'status-idle' };
  };

  const status = getStatus();

  return (
    <div className="controls">
      <div className="controls-row">
        <button
          className={`btn-main ${isListening ? 'btn-stop' : 'btn-start'}`}
          onClick={isListening ? onStop : onStart}
          disabled={!isSupported}
        >
          {isListening ? (
            <>
              <span className="btn-icon">⏹</span> Stop Listening
            </>
          ) : (
            <>
              <span className="btn-icon">🎙</span> Start Listening
            </>
          )}
        </button>

        <span className={`status-badge ${status.cls}`}>{status.label}</span>
      </div>

      {!isSupported && (
        <p className="error-msg">
          ⚠ Web Speech API is not supported in this browser. Please use{' '}
          <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
        </p>
      )}

      {error && <p className="error-msg">⚠ {error}</p>}
    </div>
  );
}
