"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_SARATHI_API_URL || "http://localhost:8089";

/** Right-side book pane (plan §11): opens the exact cited PDF page so the user can verify the
 *  source in the book itself. Pages are served as PNG by the backend (GET /book/page/{n}). */
export default function BookViewer({ page, onClose, onChange }) {
  const [pageCount, setPageCount] = useState(967);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API}/book/meta`)
      .then((r) => r.json())
      .then((m) => active && m?.page_count && setPageCount(m.page_count))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => setLoading(true), [page]);

  const go = (delta) => onChange(Math.min(pageCount, Math.max(1, page + delta)));

  return (
    <aside className="fixed inset-0 z-30 flex flex-col bg-parchment shadow-xl md:static md:inset-auto md:z-auto md:w-[480px] md:border-l md:border-saffron/20">
      <div className="flex items-center justify-between gap-2 border-b border-saffron/20 px-4 py-2.5">
        <span className="text-sm font-semibold text-maroon">📖 श्रीमद्भगवद्गीता (मूल ग्रंथ)</span>
        <button
          onClick={onClose}
          className="rounded-full px-2 py-0.5 text-ink/50 hover:bg-sand hover:text-maroon"
          aria-label="बंद करें"
        >
          ✕
        </button>
      </div>

      <div className="relative flex-1 overflow-auto bg-ink/5 p-3">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-ink/40">
            पृष्ठ खुल रहा है…
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${API}/book/page/${page}`}
          alt={`पृष्ठ ${page}`}
          onLoad={() => setLoading(false)}
          className="mx-auto w-full max-w-full rounded bg-white shadow"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-saffron/20 px-4 py-2">
        <button
          onClick={() => go(-1)}
          disabled={page <= 1}
          className="rounded-lg bg-sand px-3 py-1 text-sm text-maroon disabled:opacity-40"
        >
          ‹ पिछला
        </button>
        <span className="text-xs text-ink/55">
          पृष्ठ {page} / {pageCount}
        </span>
        <button
          onClick={() => go(1)}
          disabled={page >= pageCount}
          className="rounded-lg bg-sand px-3 py-1 text-sm text-maroon disabled:opacity-40"
        >
          अगला ›
        </button>
      </div>
    </aside>
  );
}
