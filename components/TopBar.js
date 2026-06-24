"use client";

import { useState } from "react";

export default function TopBar({ authed, connected, onAuth, onSignOut }) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-saffron/20 bg-parchment/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-shloka text-2xl font-semibold text-maroon">
            सारथी <span className="align-middle text-base text-saffron">· Sarathi</span>
          </h1>
          <p className="text-xs text-ink/55">जीवन की उलझनों में गीता की राह</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-sage" : "bg-ink/25"}`}
            title={connected ? "जुड़ा हुआ" : "जुड़ नहीं रहा"}
          />
          {authed ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-sage">सदस्य · यात्रा सुरक्षित</span>
              <button onClick={onSignOut} className="text-ink/45 hover:text-maroon">बाहर</button>
            </div>
          ) : open ? (
            <div className="flex items-center gap-1">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="w-44 rounded-lg border border-saffron/30 bg-white/70 px-2 py-1 text-sm focus:outline-none"
              />
              <button
                onClick={() => { onAuth(email); setOpen(false); }}
                className="rounded-lg bg-saffron px-3 py-1 text-sm font-medium text-parchment hover:bg-maroon"
              >
                सहेजें
              </button>
            </div>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="rounded-full border border-saffron/40 px-3 py-1 text-sm text-saffron hover:bg-saffron hover:text-parchment"
            >
              यात्रा सहेजें (साइन-इन)
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
