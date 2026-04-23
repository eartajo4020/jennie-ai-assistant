"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "Hi, I’m Jennie AI. How can I help you today?"
    }
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message;

    setChat(prev => [
      ...prev,
      { sender: "user", text: userText }
    ]);

    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          question: userText
        })
      });

      const data = await res.json();

      setChat(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "No response."
        }
      ]);

    } catch {
      setChat(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Connection failed."
        }
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow overflow-hidden">

        <div className="p-5 border-b font-bold text-2xl">
          Jennie AI
        </div>

        <div className="h-[500px] overflow-y-auto p-5 space-y-4">

          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender==="user"
                ? "justify-end"
                : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[75%] ${
                  msg.sender==="user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

        </div>

        <div className="border-t p-4 flex gap-3">
          <input
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") sendMessage();
            }}
            placeholder="Text Jennie AI..."
            className="flex-1 border rounded-full px-4 py-3"
          />

          <button
            onClick={sendMessage}
            className="bg-black text-white px-6 rounded-full"
          >
            Send
          </button>

        </div>

      </div>
    </main>
  );
}