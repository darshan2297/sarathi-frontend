"use client";

import { useEffect, useRef, useState } from "react";
import BookViewer from "@/components/BookViewer";
import Composer from "@/components/Composer";
import Message from "@/components/Message";
import StatusLine from "@/components/StatusLine";
import TopBar from "@/components/TopBar";
import { useSarathi } from "@/lib/useSarathi";

export default function Home() {
  const { messages, status, connected, authed, thinking, busy, send, authenticate, signOut } = useSarathi();
  const bottomRef = useRef(null);
  const [bookPage, setBookPage] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar authed={authed} connected={connected} onAuth={authenticate} onSignOut={signOut} />

      <div className="flex flex-1 overflow-hidden">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 && (
            <div className="mx-auto mt-10 max-w-md text-center">
              <p className="font-shloka text-3xl text-maroon">🕉️</p>
              <h2 className="mt-3 font-shloka text-xl text-maroon">मैं तुम्हारा सारथी हूँ</h2>
              <p className="prose-hi mt-2 text-ink/70">
                जीवन की कोई उलझन, कोई पीड़ा, कोई प्रश्न — जो भी मन में हो, कहो। मैं गीता की राह से,
                सरल शब्दों में, तुम्हारे साथ चलूँगा।
              </p>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} m={m} onOpenPage={setBookPage} />
          ))}

          {thinking && <StatusLine status={status} />}
          <div ref={bottomRef} />
        </div>

        {!authed && (
          <p className="px-1 pb-2 text-center text-xs text-ink/45">
            तुम अतिथि (guest) के रूप में हो — यह बातचीत केवल इसी टैब में रहेगी; टैब बंद करने पर मिट
            जाएगी। <span className="text-saffron">अपनी यात्रा सहेजने के लिए ऊपर साइन-इन करो।</span>
          </p>
        )}

        <div className="pb-3">
          <Composer onSend={send} disabled={!connected || busy} />
          <p className="mt-2 text-center text-[11px] text-ink/40">
            सारथी गीता से मार्गदर्शन देता है — यह किसी चिकित्सक या मानसिक-स्वास्थ्य विशेषज्ञ का विकल्प नहीं है।
          </p>
        </div>
      </main>

      {bookPage && (
        <BookViewer page={bookPage} onClose={() => setBookPage(null)} onChange={setBookPage} />
      )}
      </div>
    </div>
  );
}
