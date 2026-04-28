import React from "react";
import SpeechPlayer from "./SpeechPlayer";

const ResponseCard = ({ data }) => {
  if (!data) return null;

  // Build TTS text
  const speechText = data.definition
    ? `${data.topic}. ${data.definition}. ${
        Array.isArray(data.steps) ? "Steps: " + data.steps.join(". ") : ""
      }`
    : data.solution
    ? `${data.topic}. Solution: ${data.solution}. ${data.explanation || ""}`
    : data.topic;

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-md
      text-sm text-gray-800 space-y-3 max-w-[85%]">

      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xl">
          {data.type === "mathematical" ? "🧮"
           : data.type === "comparative" ? "⚖️"
           : data.type === "complexity"  ? "📊"
           : "📘"}
        </span>
        <h2 className="text-base font-bold text-indigo-700">{data.topic}</h2>
        {data.category && (
          <span className="bg-indigo-50 text-indigo-500 text-xs px-2 py-0.5 rounded-full">
            {data.category}
          </span>
        )}
        {data.difficulty && (
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${data.difficulty === "beginner"     ? "bg-green-50 text-green-600"
            : data.difficulty === "intermediate" ? "bg-yellow-50 text-yellow-600"
            : "bg-red-50 text-red-600"}`}>
            {data.difficulty}
          </span>
        )}
      </div>

      {/* ── MATHEMATICAL / RECURRENCE ── */}
      {data.type === "mathematical" && (
        <div className="space-y-2">
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="font-semibold text-indigo-700 mb-1">Recurrence:</p>
            <code className="text-sm">T(n) = {data.a}T(n/{data.b}) + n^{data.k}</code>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="font-semibold text-green-700 mb-1">{data.case}</p>
            <p className="text-xs text-gray-600 mb-1">Condition: {data.condition}</p>
            <p className="text-base font-bold text-green-800">{data.solution}</p>
            <p className="text-xs text-gray-500 mt-1">{data.explanation}</p>
          </div>
        </div>
      )}

      {/* ── COMPARATIVE ── */}
      {data.type === "comparative" && (
  <div className="space-y-3">
    {data.comparison_text && (
      <p className="text-gray-600 italic text-xs bg-yellow-50 
        border-l-4 border-yellow-400 px-3 py-2 rounded">
        {data.comparison_text}
      </p>
    )}
    <div className="grid grid-cols-2 gap-3">
      {[data.topic1, data.topic2].map((t, i) => t && (
        <div key={i} className="border border-indigo-100 
          rounded-xl p-3 space-y-2 bg-gray-50">
          <p className="font-bold text-indigo-700 text-sm">{t.name}</p>
          {t.timeComplexity && (
            <p className="text-xs text-gray-600">⏱ {t.timeComplexity}</p>
          )}
          {t.spaceComplexity && (
            <p className="text-xs text-gray-600">💾 {t.spaceComplexity}</p>
          )}
          {(t.advantages || []).slice(0, 2).map((a, j) => (
            <p key={j} className="text-xs text-green-600">✅ {a}</p>
          ))}
          {(t.disadvantages || []).slice(0, 2).map((d, j) => (
            <p key={j} className="text-xs text-red-500">❌ {d}</p>
          ))}
        </div>
      ))}
    </div>
  </div>
)}

      {/* ── COMPLEXITY ── */}
      {data.type === "complexity" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Best Case",    value: data.bestCase,        color: "green" },
              { label: "Average Case", value: data.timeComplexity,  color: "blue"  },
              { label: "Worst Case",   value: data.worstCase,       color: "red"   },
              { label: "Space",        value: data.spaceComplexity, color: "purple"},
            ].map(({ label, value, color }) => value && (
              <div key={label} className={`bg-${color}-50 rounded-lg p-2 text-center`}>
                <p className={`text-xs text-${color}-600 font-medium`}>{label}</p>
                <p className={`text-sm font-bold text-${color}-800`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONCEPTUAL / PROCEDURAL ── */}
      {(data.type === "conceptual" || data.type === "procedural" || !data.type) && (
        <>
          {data.definition && (
            <div>
              <p className="font-semibold text-gray-600 mb-1">Definition:</p>
              <p className="text-gray-700">{data.definition}</p>
            </div>
          )}
          {data.intuition && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded">
              <p className="text-xs font-semibold text-yellow-700 mb-0.5">💡 Intuition:</p>
              <p className="text-gray-700 text-xs">{data.intuition}</p>
            </div>
          )}
          {data.steps?.length > 0 && (
            <div>
              <p className="font-semibold text-gray-600 mb-1">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                {data.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}
          {data.pseudocode && (
            <div>
              <p className="font-semibold text-gray-600 mb-1">Pseudocode:</p>
              <code className="bg-gray-900 text-green-400 px-3 py-2 rounded-lg
                text-xs block whitespace-pre-wrap">{data.pseudocode}</code>
            </div>
          )}
          {data.example && (
            <div>
              <p className="font-semibold text-gray-600 mb-1">Example:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs block whitespace-pre-wrap">
                {typeof data.example === "object"
                  ? `Input: ${data.example.input}\n${
                      data.example.steps
                        ? data.example.steps.join("\n")
                        : ""
                    }\nOutput: ${data.example.output || ""}`
                  : data.example}
              </code>
            </div>
          )}
          {(data.timeComplexity || data.spaceComplexity) && (
            <div className="flex gap-3 flex-wrap mt-1">
              {data.timeComplexity && (
                <span className="bg-green-100 text-green-700 px-3 py-1
                  rounded-full text-xs font-semibold">
                  ⏱ Time: {data.timeComplexity}
                </span>
              )}
              {data.spaceComplexity && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1
                  rounded-full text-xs font-semibold">
                  💾 Space: {data.spaceComplexity}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Speech Player */}
      <div className="border-t pt-3 mt-2">
        <SpeechPlayer text={speechText} autoPlay={true} />
      </div>
    </div>
  );
};

export default ResponseCard;