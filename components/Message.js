"use client";

import { useState } from "react";
import SafetyCard from "./SafetyCard";
import VerseCard from "./VerseCard";

function Feedback() {
  const [v, setV] = useState(null);
  return (
    <div className="mt-2 flex items-center gap-2 text-ink/40">
      {["up", "down"].map((k) => (
        <button
          key={k}
          onClick={() => setV(k)}
          className={`text-sm transition-colors hover:text-saffron ${v === k ? "text-saffron" : ""}`}
          aria-label={k === "up" ? "सहायक" : "असहायक"}
        >
          {k === "up" ? "👍" : "👎"}
        </button>
      ))}
    </div>
  );
}

export default function Message({ m, onOpenPage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-sand px-4 py-2.5 text-ink shadow-sm">
          {m.text}
        </div>
      </div>
    );
  }

  // sarathi
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-saffron">सारथी</span>
          {m.degraded && (
            <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/40" title="fallback / degraded mode">
              degraded
            </span>
          )}
        </div>

        <div className="mt-1 rounded-2xl rounded-bl-sm border border-saffron/15 bg-white/55 px-4 py-3 shadow-sm">
          {m.safety && <SafetyCard safety={m.safety} />}
          <p className="prose-hi whitespace-pre-wrap text-ink">
            {m.text}
            {!m.done && <span className="ml-0.5 inline-block animate-breathe">▍</span>}
          </p>
          {m.verse && <VerseCard verse={m.verse} onOpenPage={onOpenPage} />}
          {m.error && <p className="mt-2 text-sm text-maroon">{m.error}</p>}
          {m.done && !m.error && <Feedback />}
        </div>
      </div>
    </div>
  );
}
