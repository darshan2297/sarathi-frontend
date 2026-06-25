"use client";

import { useState } from "react";

/** Verse card (plan §11): citation badge + Sanskrit, expandable to transliteration,
 *  Hindi translation, and word-meanings. All text is canonical (injected by the backend). */
export default function VerseCard({ verse, onOpenPage }) {
  const [open, setOpen] = useState(false);
  if (!verse) return null;

  const meaning = verse.translation_hi || verse.translation_en;

  return (
    <div className="mt-3 rounded-xl border border-saffron/30 bg-sand/70 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-maroon/90 px-2.5 py-0.5 text-xs font-semibold text-parchment">
          {verse.citation}
        </span>
        <div className="flex items-center gap-3">
          {verse.pdf_page && onOpenPage && (
            <button
              onClick={() => onOpenPage(verse.pdf_page)}
              className="text-xs text-saffron transition-colors hover:text-maroon"
              title="मूल ग्रंथ में यह पृष्ठ खोलो"
            >
              📖 ग्रंथ में देखें
            </button>
          )}
          {(verse.sanskrit || meaning || verse.word_meanings_hi) && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-xs text-saffron transition-colors hover:text-maroon"
            >
              {open ? "कम दिखाओ ▲" : "अर्थ देखें ▼"}
            </button>
          )}
        </div>
      </div>

      {verse.sanskrit && (
        <p className="mt-2 font-shloka text-lg leading-relaxed text-maroon">{verse.sanskrit}</p>
      )}

      {open && (
        <div className="mt-3 space-y-2 border-t border-saffron/20 pt-3 text-sm">
          {verse.transliteration && (
            <p className="italic text-ink/60">{verse.transliteration}</p>
          )}
          {meaning && <p className="prose-hi text-ink">{meaning}</p>}
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
