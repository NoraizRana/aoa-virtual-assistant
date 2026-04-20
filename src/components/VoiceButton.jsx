import React, { useState, useRef } from "react";

const VoiceButton = ({ onResult, onListening, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Use Chrome for voice input.");
      return;
    }

    // Request microphone permission explicitly
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
          setIsListening(true);
          setError("");
          if (onListening) onListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript);
          setIsListening(false);
          if (onListening) onListening(false);
        };

        recognition.onerror = (event) => {
          if (event.error === "not-allowed") {
            setError("Mic access denied. Allow mic in browser settings.");
          } else if (event.error === "no-speech") {
            setError("No speech detected. Try again.");
          } else {
            setError(`Error: ${event.error}`);
          }
          setIsListening(false);
          if (onListening) onListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (onListening) onListening(false);
        };

        recognition.start();
      })
      .catch(() => {
        setError("Mic access denied. Allow mic in browser settings.");
      });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (onListening) onListening(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? "Click to stop" : "Click to speak"}
        className={`w-11 h-11 rounded-full flex items-center justify-center 
          transition-all shadow-md text-white text-lg relative
          ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : isListening
            ? "bg-red-500 cursor-pointer scale-110"
            : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer hover:scale-105"
          }`}
      >
        {/* Ripple animation when listening */}
        {isListening && (
          <span className="absolute inline-flex h-full w-full rounded-full 
            bg-red-400 opacity-75 animate-ping"></span>
        )}
        <span className="relative">{isListening ? "⏹" : "🎤"}</span>
      </button>

      {isListening && (
        <span className="text-xs text-red-500 mt-1 font-medium animate-pulse">
          Listening...
        </span>
      )}
      {error && !isListening && (
        <span className="text-xs text-red-400 mt-1 text-center max-w-[130px] leading-tight">
          {error}
        </span>
      )}
    </div>
  );
};

export default VoiceButton;