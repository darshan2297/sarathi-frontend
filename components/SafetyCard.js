/** Crisis safety card (plan §8) — gentle, never alarming; surfaces verified helplines. */
export default function SafetyCard({ safety }) {
  if (!safety) return null;
  return (
    <div className="mt-3 rounded-xl border border-sage/40 bg-sage/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage">सहायता · You are not alone</p>
      <ul className="mt-2 space-y-1.5">
        {safety.helplines?.map((h) => (
          <li key={h.number} className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-maroon">{h.number}</span>
            <span className="text-ink/80">{h.name}</span>
            {h.note && <span className="text-ink/50 text-xs">· {h.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
