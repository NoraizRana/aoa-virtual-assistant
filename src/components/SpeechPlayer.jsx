import React, { useState, useEffect } from "react";

const SpeechPlayer = ({ text, autoPlay = true }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(0.95);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const englishVoices = available.filter((v) =>
        v.lang.startsWith("en")
      );
      setVoices(englishVoices);
      if (englishVoices.length > 0) setSelectedVoice(englishVoices[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Auto-play when new text arrives
  useEffect(() => {
    if (text && autoPlay) {
      handleSpeak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleSpeak = () => {
    if (!text) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // stop previous

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!text) return null;

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      {/* Play / Replay */}
      <button
        onClick={handleSpeak}
        title="Play / Replay"
        className="flex items-center gap-1 text-xs bg-indigo-100 hover:bg-indigo-200 
          text-indigo-700 px-3 py-1 rounded-full transition font-medium"
      >
        🔊 {isSpeaking && !isPaused ? "Replaying" : "Play"}
      </button>

      {/* Pause */}
      {isSpeaking && !isPaused && (
        <button
          onClick={handlePause}
          title="Pause"
          className="flex items-center gap-1 text-xs bg-yellow-100 hover:bg-yellow-200 
            text-yellow-700 px-3 py-1 rounded-full transition font-medium"
        >
          ⏸ Pause
        </button>
      )}

      {/* Resume */}
      {isPaused && (
        <button
          onClick={handleResume}
          title="Resume"
          className="flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 
            text-green-700 px-3 py-1 rounded-full transition font-medium"
        >
          ▶️ Resume
        </button>
      )}

      {/* Stop */}
      {isSpeaking && (
        <button
          onClick={handleStop}
          title="Stop"
          className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 
            text-red-700 px-3 py-1 rounded-full transition font-medium"
        >
          ⏹ Stop
        </button>
      )}

      {/* Speed control */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>Speed:</span>
        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="text-xs border rounded px-1 py-0.5 text-gray-700"
        >
          <option value={0.7}>Slow</option>
          <option value={0.95}>Normal</option>
          <option value={1.2}>Fast</option>
        </select>
      </div>

      {/* Voice selector */}
      {voices.length > 1 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Voice:</span>
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) => {
              const v = voices.find((v) => v.name === e.target.value);
              setSelectedVoice(v);
            }}
            className="text-xs border rounded px-1 py-0.5 text-gray-700 max-w-[120px]"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SpeechPlayer;