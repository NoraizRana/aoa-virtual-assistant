import React, { useState } from "react";
import SpeechPlayer from "./SpeechPlayer";

// ── Complexity badge ──────────────────────────────────────────────
const Badge = ({ label, value, color }) => {
  if (!value) return null;
  const colors = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red:    "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full 
      text-xs font-semibold border ${colors[color] || colors.blue}`}>
      {label}: {value}
    </span>
  );
};

// ── Section heading ───────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <div className="space-y-2">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
      <span>{icon}</span> {title}
    </p>
    {children}
  </div>
);

// ── Main ResponseCard ─────────────────────────────────────────────
const ResponseCard = ({ data }) => {
  const [showPseudo, setShowPseudo] = useState(false);

  if (!data) return null;

  const {
    type, topic, category, difficulty,
    definition, intuition, steps, pseudocode,
    example, keyPoints, advantages, disadvantages,
    timeComplexity, spaceComplexity,
    comparison_text, topic1, topic2,
    followUp, chapters, source,
    // math specific
    cases, log_b_a, solution,
    // complexity specific
    bestCase, worstCase,
    // notations
    notations, common_complexities,
  } = data;

  // Build TTS text
  const speechText = [
    topic ? `Topic: ${topic}.` : "",
    definition ? definition.substring(0, 200) : "",
    keyPoints?.length ? `Key points: ${keyPoints.slice(0,2).join(". ")}` : "",
  ].filter(Boolean).join(" ");

  // Icon per type
  const icons = {
    conceptual:   "📘", procedural: "⚙️",
    mathematical: "🧮", comparative: "⚖️",
    complexity:   "📊", example:     "🔍",
    restriction:  "🚫", "not-found": "❓",
  };
  const icon = icons[type] || "📘";

  // Difficulty color
  const diffColor = {
    beginner:     "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced:     "bg-red-100 text-red-700",
  }[difficulty] || "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm
      overflow-hidden max-w-[88%] text-sm text-gray-800">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 
        px-5 py-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{icon}</span>
          <h2 className="text-white font-bold text-sm leading-tight">{topic}</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {category && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 
              rounded-full capitalize">{category}</span>
          )}
          {difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full 
              font-medium ${diffColor}`}>{difficulty}</span>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-4">

        {/* ── RESTRICTION / NOT FOUND ── */}
        {(type === "restriction" || type === "not-found") && definition && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-orange-800 whitespace-pre-line text-sm leading-relaxed">
              {definition}
            </p>
          </div>
        )}

        {/* ── MATHEMATICAL ── */}
        {type === "mathematical" && definition && (
          <div className="space-y-3">
            <div className="bg-indigo-50 border border-indigo-200 
              rounded-xl p-4 font-mono text-xs whitespace-pre-line 
              text-indigo-900 leading-relaxed">
              {definition}
            </div>
            {keyPoints?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {keyPoints.map((pt, i) => (
                  <div key={i} className="bg-gray-50 border rounded-lg 
                    px-3 py-2 text-xs text-gray-700 font-medium">
                    {pt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLEXITY ── */}
        {type === "complexity" && (
          <div className="space-y-3">
            <div className="bg-gray-50 border rounded-xl p-4 
              font-mono text-xs whitespace-pre-line text-gray-800 leading-relaxed">
              {definition}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label="Time (avg)"   value={timeComplexity}  color="green"  />
              <Badge label="Space"        value={spaceComplexity} color="blue"   />
              <Badge label="Best Case"    value={data.bestCase}   color="purple" />
              <Badge label="Worst Case"   value={data.worstCase}  color="red"    />
            </div>
          </div>
        )}

        {/* ── COMPARATIVE ── */}
        {type === "comparative" && (
          <div className="space-y-3">
            {comparison_text && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 
                px-3 py-2 rounded-r-xl text-xs text-yellow-900 italic">
                {comparison_text}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[topic1, topic2].map((t, i) => t && (
                <div key={i} className="border border-indigo-100 rounded-xl 
                  p-3 space-y-2 bg-indigo-50/30">
                  <p className="font-bold text-indigo-700 text-xs border-b 
                    border-indigo-100 pb-1">{t.name}</p>
                  {t.timeComplexity && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">⏱ Time:</span> {t.timeComplexity}
                    </p>
                  )}
                  {t.spaceComplexity && (
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">💾 Space:</span> {t.spaceComplexity}
                    </p>
                  )}
                  {(t.advantages || []).slice(0, 2).map((a, j) => (
                    <p key={j} className="text-xs text-emerald-700">✅ {a}</p>
                  ))}
                  {(t.disadvantages || []).slice(0, 2).map((d, j) => (
                    <p key={j} className="text-xs text-red-500">❌ {d}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONCEPTUAL / PROCEDURAL / EXAMPLE ── */}
        {!["mathematical","complexity","comparative","restriction","not-found"]
          .includes(type) && (
          <div className="space-y-4">

            {/* Definition */}
            {definition && (
              <Section title="Definition" icon="📖">
                <p className="text-gray-700 leading-relaxed">{definition}</p>
              </Section>
            )}

            {/* Intuition */}
            {intuition && (
              <div className="bg-amber-50 border-l-4 border-amber-400 
                px-3 py-2 rounded-r-xl">
                <p className="text-xs font-bold text-amber-700 mb-0.5">
                  💡 Intuition
                </p>
                <p className="text-xs text-amber-900">{intuition}</p>
              </div>
            )}

            {/* Steps */}
            {steps?.length > 0 && (
              <Section title="Steps / Algorithm" icon="🔢">
                <ol className="space-y-1">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 
                        text-indigo-700 rounded-full flex items-center 
                        justify-center text-xs font-bold">{i + 1}</span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Pseudocode toggle */}
            {pseudocode && (
              <div>
                <button
                  onClick={() => setShowPseudo(p => !p)}
                  className="text-xs font-semibold text-indigo-600 
                    hover:text-indigo-800 flex items-center gap-1 
                    transition mb-2"
                >
                  <span>{showPseudo ? "▼" : "▶"}</span>
                  {showPseudo ? "Hide" : "Show"} Pseudocode
                </button>
                {showPseudo && (
                  <pre className="bg-gray-900 text-green-400 px-4 py-3 
                    rounded-xl text-xs whitespace-pre-wrap font-mono 
                    leading-relaxed overflow-x-auto">
                    {pseudocode}
                  </pre>
                )}
              </div>
            )}

            {/* Example */}
            {example && (
              <Section title="Example" icon="🔍">
                <div className="bg-gray-50 border border-gray-200 
                  rounded-xl p-3 text-xs space-y-1 font-mono">
                  {example.input && (
                    <p><span className="text-gray-500">Input: </span>
                      <span className="text-gray-800">{example.input}</span></p>
                  )}
                  {example.steps?.map((s, i) => (
                    <p key={i} className="text-gray-600">
                      <span className="text-indigo-500">Step {i+1}:</span> {s}
                    </p>
                  ))}
                  {example.output && (
                    <p className="font-bold text-emerald-700 border-t 
                      border-gray-200 pt-1 mt-1">
                      Output: {example.output}
                    </p>
                  )}
                </div>
              </Section>
            )}

            {/* Advantages / Disadvantages */}
            {(advantages?.length > 0 || disadvantages?.length > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {advantages?.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 
                    rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-emerald-700 mb-1">
                      ✅ Advantages
                    </p>
                    {advantages.slice(0, 3).map((a, i) => (
                      <p key={i} className="text-xs text-emerald-800">{a}</p>
                    ))}
                  </div>
                )}
                {disadvantages?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 
                    rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-red-700 mb-1">
                      ❌ Disadvantages
                    </p>
                    {disadvantages.slice(0, 3).map((d, i) => (
                      <p key={i} className="text-xs text-red-800">{d}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLEXITY BADGES (all types) ── */}
        {type !== "comparative" && type !== "mathematical" && 
         type !== "complexity" && (timeComplexity || spaceComplexity) && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
            <Badge label="⏱ Time"  value={timeComplexity}  color="green" />
            <Badge label="💾 Space" value={spaceComplexity} color="blue"  />
          </div>
        )}

        {/* ── SOURCE ── */}
        {(source || chapters?.length > 0) && (
          <div className="bg-indigo-50 border border-indigo-100 
            rounded-lg px-3 py-1.5">
            <p className="text-xs text-indigo-700 font-medium">
              📖 {source || "CLRS"}
              {chapters?.length > 0 && ` — ${chapters.join(", ")}`}
            </p>
          </div>
        )}

        {/* ── FOLLOW-UP QUESTIONS ── */}
        {followUp?.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 mb-2">
              💬 Try asking:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {followUp.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const input = document.querySelector("input[type=text]");
                    if (input) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype, "value"
                      ).set;
                      nativeInputValueSetter.call(input, q);
                      input.dispatchEvent(new Event("input", { bubbles: true }));
                      input.focus();
                    }
                  }}
                  className="text-xs bg-gray-100 hover:bg-indigo-100 
                    text-gray-600 hover:text-indigo-700 px-2.5 py-1 
                    rounded-full transition border border-transparent 
                    hover:border-indigo-200 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SPEECH PLAYER ── */}
        <div className="border-t border-gray-100 pt-3">
          <SpeechPlayer text={speechText} autoPlay={false} />
        </div>
      </div>
    </div>
  );
};

export default ResponseCard;