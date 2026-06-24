"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL =
  process.env.NEXT_PUBLIC_SARATHI_WS_URL || "ws://localhost:8000/ws/chat";

/**
 * Drives the Sarathi WebSocket (plan §10 protocol):
 *   meta · status · token · verse_card · safety · done · error
 * Streamed tokens accumulate into the in-flight assistant message.
 */
export function useSarathi() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(null); // { user_id, tier }
  const [thinking, setThinking] = useState(false);

  const wsRef = useRef(null);
  const turnRef = useRef(0); // current assistant message id

  const patchDraft = useCallback((id, patch) => {
    setMessages((ms) =>
      ms.map((m) =>
        m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m
      )
    );
  }, []);

  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      setConnected(false);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      const saved = typeof window !== "undefined" && localStorage.getItem("sarathi_email");
      if (saved) ws.send(JSON.stringify({ type: "auth", email: saved }));
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      const ev = JSON.parse(e.data);
      const id = turnRef.current;
      switch (ev.type) {
        case "authed":
          setAuthed({ user_id: ev.user_id, tier: ev.tier });
          break;
        case "meta":
          if (ev.mode) patchDraft(id, { mode: ev.mode, intent: ev.intent, emotion: ev.emotion });
          break;
        case "status":
          setStatus(ev.stage);
          setThinking(true);
          break;
        case "token":
          patchDraft(id, (m) => ({ text: m.text + ev.text }));
          break;
        case "verse_card":
          patchDraft(id, { verse: ev });
          break;
        case "safety":
          patchDraft(id, { safety: { message: ev.message, helplines: ev.helplines } });
          break;
        case "done":
          patchDraft(id, {
            done: true,
            grounded: ev.grounded,
            degraded: ev.degraded,
            provider: ev.provider,
            verified: ev.verified,
            mode: ev.mode,
            safetyFlag: ev.safety,
          });
          setStatus(null);
          setThinking(false);
          break;
        case "error":
          patchDraft(id, { error: ev.message, done: true });
          setStatus(null);
          setThinking(false);
          break;
        default:
          break;
      }
    };

    return () => ws.close();
  }, [patchDraft]);

  const send = useCallback((text) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    const turn = ++turnRef.current;
    setMessages((ms) => [
      ...ms,
      { id: `u${turn}`, role: "user", text },
      { id: turn, role: "sarathi", text: "", done: false },
    ]);
    ws.send(JSON.stringify({ type: "user_message", text }));
  }, []);

  const authenticate = useCallback((email) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !email.includes("@")) return;
    ws.send(JSON.stringify({ type: "auth", email }));
    if (typeof window !== "undefined") localStorage.setItem("sarathi_email", email);
  }, []);

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem("sarathi_email");
    setAuthed(null);
  }, []);

  return { messages, status, connected, authed, thinking, send, authenticate, signOut };
}
