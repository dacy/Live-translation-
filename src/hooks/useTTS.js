import { useState, useRef, useCallback, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const queueRef = useRef([]);
  const speakingRef = useRef(false);
  const voiceRef = useRef(null);

  // Load zh-CN voice once voices are available
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer zh-CN, fall back to any zh voice
      voiceRef.current =
        voices.find((v) => v.lang === 'zh-CN') ||
        voices.find((v) => v.lang.startsWith('zh')) ||
        null;
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const processQueue = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0) return;

    const text = queueRef.current.shift();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => {
      speakingRef.current = true;
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      processQueue();
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!text) return;
      queueRef.current.push(text);
      processQueue();
    },
    [processQueue]
  );

  const cancelAll = useCallback(() => {
    queueRef.current = [];
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, cancelAll };
}
