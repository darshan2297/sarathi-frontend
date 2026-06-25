"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL =
  process.env.NEXT_PUBLIC_SARATHI_WS_URL || "ws://localhost:8087/ws/chat";

// Per-tab conversation cache. sessionStorage (not localStorage) keeps the guest
// promise honest: the transcript survives an accidental reload or a dropped
// socket, but is gone for good once the tab closes.
const STORE_KEY = "sarathi_session_v1";

/** Highest numeric (assistant) turn id already present — used to resume the counter. */
function maxTurn(messages) {
  return messages.reduce(
    (mx, m) => (typeof m.id === "number" && m.id > mx ? m.id : mx),
    0
  );
}

/**
 * Drives the Sarathi WebSocket (plan §10 protocol):
 *   meta · status · token · verse_card · safety · done · error
 * Streamed tokens accumulate into the in-flight assistant message.
 *
 * Robustness (QA I-1 / I-2):
 *  - the socket auto-reconnects with backoff so a drop never strands the session;
 *  - the transcript is mirrored to sessionStorage so a reload/remount never wipes it;
 *  - exactly one turn is in flight at a time, so a previous turn's events
 *    (e.g. a crisis card) can never bleed onto a later, unrelated answer.
 */
export function useSarathi() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(null); // { user_id, tier }
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false); // a turn is in flight

  const wsRef = useRef(null);
  const turnRef = useRef(0); // current assistant message id
  const busyRef = useRef(false); // mirror of `busy` for use inside stable callbacks
  const hydratedRef = useRef(false);

  const patchDraft = useCallback((id, patch) => {
    setMessages((ms) =>
      ms.map((m) =>
        m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m
      )
    );
  }, []);

  // --- Rehydrate the transcript on mount (client-only, to avoid SSR mismatch). ---
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // A turn interrupted by the reload is force-completed so we don't render
        // a stuck "typing" caret or leave the composer locked forever.
        const restored = (saved || []).map((m) =>
          m.role === "sarathi" && !m.done ? { ...m, done: true } : m
        );
        if (restored.length) {
          setMessages(restored);
          turnRef.current = maxTurn(restored);
        }
      }
    } catch {
      /* corrupt cache — start fresh */
    }
    hydratedRef.current = true;
  }, []);

  // --- Persist the transcript whenever it changes (after the first hydrate). ---
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [messages]);

  // --- Connect, with auto-reconnect on unexpected drops. ---
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let attempts = 0;
    let closedByUs = false;

    const handleMessage = (e) => {
      let ev;
      try {
        ev = JSON.parse(e.data);
      } catch {
        return; // ignore malformed / non-JSON frames instead of throwing
      }
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
          setBusy(false);
          busyRef.current = false;
          break;
        case "error":
          patchDraft(id, { error: ev.message, done: true });
          setStatus(null);
          setThinking(false);
          setBusy(false);
          busyRef.current = false;
          break;
        default:
          break;
      }
    };

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        setConnected(false);
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        attempts = 0;
        const saved =
          typeof window !== "undefined" && localStorage.getItem("sarathi_email");
        if (saved) ws.send(JSON.stringify({ type: "auth", email: saved }));
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closedByUs) {
          // If a turn was streaming when the socket dropped, release the lock so
          // the user isn't stuck once we reconnect.
          if (busyRef.current) {
            setBusy(false);
            busyRef.current = false;
            setThinking(false);
            setStatus(null);
          }
          scheduleReconnect();
        }
      };
      ws.onerror = () => setConnected(false);
      ws.onmessage = handleMessage;
    };

    const scheduleReconnect = () => {
      attempts += 1;
      const delay = Math.min(1000 * 2 ** attempts, 15000); // 2s → 4s → … → 15s cap
      reconnectTimer = setTimeout(connect, delay);
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [patchDraft]);

  const send = useCallback((text) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    if (busyRef.current) return; // one turn at a time — prevents cross-turn bleed (I-2)
    const turn = ++turnRef.current;
    setMessages((ms) => [
      ...ms,
      { id: `u${turn}`, role: "user", text },
      { id: turn, role: "sarathi", text: "", done: false },
    ]);
    // Lock immediately and show progress before the first status arrives (L-4).
    setBusy(true);
    busyRef.current = true;
    setThinking(true);
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

  return { messages, status, connected, authed, thinking, busy, send, authenticate, signOut };
}
