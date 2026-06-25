"use client";

import { useState } from "react";

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends; Shift+Enter inserts a newline. Ignore Enter while an IME
          // (e.g. Devanagari) is mid-composition, so it commits text instead of sending.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="अपने मन की बात कहो, वत्स…"
        className="prose-hi max-h-40 min-h-[48px] flex-1 resize-none rounded-2xl border border-saffron/25 bg-white/70 px-4 py-3 text-ink placeholder:text-ink/35 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron/40"
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="rounded-2xl bg-saffron px-5 py-3 font-semibold text-parchment shadow-sm transition-colors hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-40"
      >
        भेजें
      </button>
    </div>
  );
}
