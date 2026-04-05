import React, { useState, useCallback, useRef } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';
import { useTTS } from './hooks/useTTS.js';
import Controls from './components/Controls.jsx';
import TranscriptPanel from './components/TranscriptPanel.jsx';
import TranslationPanel from './components/TranslationPanel.jsx';

let segmentCounter = 0;

export default function App() {
  const [segments, setSegments] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const { speak, isSpeaking, cancelAll } = useTTS();

  const handleFinalResult = useCallback(
    async (text) => {
      const id = ++segmentCounter;

      // Add English immediately, Chinese pending
      setSegments((prev) => [...prev, { id, english: text, chinese: null }]);
      setPendingCount((n) => n + 1);
      setIsTranslating(true);
      setApiError(null);

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const { translation } = data;

        setSegments((prev) =>
          prev.map((seg) => (seg.id === id ? { ...seg, chinese: translation } : seg))
        );

        speak(translation);
      } catch (err) {
        setApiError(err.message);
        setSegments((prev) =>
          prev.map((seg) =>
            seg.id === id ? { ...seg, chinese: '[Translation error]' } : seg
          )
        );
      } finally {
        setPendingCount((n) => Math.max(0, n - 1));
        setIsTranslating(false);
      }
    },
    [speak]
  );

  const { isListening, interimText, isSupported, error: speechError, start, stop } =
    useSpeechRecognition({ onFinalResult: handleFinalResult });

  const handleStop = useCallback(() => {
    stop();
    cancelAll();
  }, [stop, cancelAll]);

  const handleClear = useCallback(() => {
    setSegments([]);
    setApiError(null);
    cancelAll();
  }, [cancelAll]);

  const displayedError = speechError || apiError;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">🎙</span>
            Live Translation
            <span className="header-sub">English → 中文</span>
          </h1>
          <Controls
            isListening={isListening}
            isTranslating={isTranslating}
            isSpeaking={isSpeaking}
            onStart={start}
            onStop={handleStop}
            isSupported={isSupported}
            error={displayedError}
          />
        </div>
      </header>

      <main className="panels">
        <TranscriptPanel segments={segments} interimText={interimText} />
        <div className="panel-divider" />
        <TranslationPanel
          segments={segments}
          isSpeaking={isSpeaking}
          pendingCount={pendingCount}
        />
      </main>

      {segments.length > 0 && (
        <div className="footer">
          <button className="btn-clear" onClick={handleClear}>
            Clear All
          </button>
          <span className="segment-count">{segments.length} segment{segments.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
