"use client";

import { useState } from "react";

/** Verse card (plan §11): citation badge + Sanskrit, expandable to transliteration,
 *  Hindi translation, and word-meanings. All text is canonical (injected by the backend). */
export default function VerseCard({ verse }) {
  const [open, setOpen] = useState(false);
  if (!verse) return null;

  return (
    <div className="mt-3 rounded-xl border border-saffron/30 bg-sand/70 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-maroon/90 px-2.5 py-0.5 text-xs font-semibold text-parchment">
          {verse.citation}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-saffron hover:text-maroon transition-colors"
        >
          {open ? "कम दिखाओ ▲" : "अर्थ देखें ▼"}
        </button>
      </div>

      <p className="mt-2 font-shloka text-lg leading-relaxed text-maroon">{verse.sanskrit}</p>

      {open && (
        <div className="mt-3 space-y-2 border-t border-saffron/20 pt-3 text-sm">
          {verse.transliteration && (
            <p className="italic text-ink/60">{verse.transliteration}</p>
          )}
          {verse.translation_hi && (
            <p className="prose-hi text-ink">{verse.translation_hi}</p>
          )}
          {verse.word_meanings_hi && (
            <p className="text-ink/70">
              <span className="font-semibold text-sage">शब्दार्थ: </span>
              {verse.word_meanings_hi}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
