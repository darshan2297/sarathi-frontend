/** "गुरु विचार कर रहे हैं…" — latency mask tied to the active graph node (plan §10.1).
 *  Falls back to a generic "listening" line so there is always feedback between
 *  sending a message and the first `status` event arriving (QA L-4). */
export default function StatusLine({ status }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2 text-sm text-saffron">
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-saffron" />
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-saffron [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-saffron [animation-delay:0.4s]" />
      </span>
      <span className="italic">गुरु {status || "सुन रहे हैं"}…</span>
    </div>
  );
}
