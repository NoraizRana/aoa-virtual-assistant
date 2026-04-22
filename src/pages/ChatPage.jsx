import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "../components/MessageBubble";
import VoiceButton from "../components/VoiceButton";
import ResponseCard from "../components/ResponseCard";
import SpeechPlayer from "../components/SpeechPlayer";
import { sendQuery } from "../services/api";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hello! I'm your AoA Teaching Assistant. Ask me anything about algorithms — Merge Sort, Dijkstra, Dynamic Programming, and more!",
      structured: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (type, text, structured = null) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type, text, structured },
    ]);
  };

  const handleSend = async (queryText) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    addMessage("user", query);
    setInput("");
    setLoading(true);

    try {
  const res = await sendQuery(query);
  const data = res.data;

  if (data.structured) {
    // Check if AI refused the query
    if (data.structured.type === "error" || 
        data.structured.type === "restriction") {
      addMessage("bot", data.structured.definition);
    } else {
      addMessage("bot", null, data.structured);
    }
  } else {
    addMessage(
      "bot",
      data.message || "❓ I couldn't find that topic."
    );
  }
} catch (err) {
  console.error("Frontend error:", err);
  addMessage(
    "bot",
    "⚠️ Could not connect to the server. Please make sure the backend is running on port 3001."
  );
} finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.structured ? (
              /* Structured bot response */
              <div className="flex justify-start mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center 
                  justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                  🤖
                </div>
                <ResponseCard data={msg.structured} />
              </div>
            ) : msg.type === "bot" && msg.text ? (
              /* Plain bot text with TTS */
              <div className="flex justify-start mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center 
                  justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                  🤖
                </div>
                <div className="max-w-[75%]">
                  <div className="bg-white border border-gray-200 px-4 py-3 
                    rounded-2xl rounded-bl-sm text-sm text-gray-800 shadow-sm">
                    {msg.text}
                  </div>
                  {/* TTS for plain bot messages too */}
                  <SpeechPlayer text={msg.text} autoPlay={false} />
                </div>
              </div>
            ) : (
              /* User message */
              <MessageBubble message={msg.text} type={msg.type} />
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center 
              justify-center text-white text-sm mr-2 flex-shrink-0">
              🤖
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 
              rounded-2xl rounded-bl-sm text-sm shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
                style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
                style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
                style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Voice status bar */}
      {listening && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2 
          flex items-center gap-2 text-red-600 text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping 
            inline-block"></span>
          Listening... speak your question now
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t bg-white px-4 py-3 flex items-center gap-3 shadow-inner">
        
        {/* Voice button */}
        <VoiceButton
          disabled={loading}
          onResult={(transcript) => {
            setInput(transcript);
            handleSend(transcript);
          }}
          onListening={setListening}
        />

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={
            listening
              ? "🎤 Listening..."
              : "Ask about any algorithm... (e.g. 'Explain Merge Sort')"
          }
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm 
            focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
            disabled:bg-gray-50 disabled:text-gray-400"
        />

        {/* Send button */}
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm 
            font-semibold hover:bg-indigo-700 disabled:opacity-40 
            transition flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;