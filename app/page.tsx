"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      setResponse("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setResponse("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(data.error || "Something went wrong.");
        return;
      }

      setResponse(data.answer);

    } catch (error) {
      setResponse("Failed connecting to AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Ask Jennie AI
          </h1>

          <p className="text-lg">
            Real Estate Broker • Hablo Español
          </p>

          <p className="mt-4">
            224-388-2478 • JArtajo@StarckRE.com
          </p>
        </div>

        <div className="border rounded-2xl p-6 shadow">

          <input
            value={question}
            onChange={(e)=>setQuestion(e.target.value)}
            placeholder="Ask a real estate question..."
            className="w-full border rounded-xl p-4 mb-4"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            {loading ? "Thinking..." : "Ask Jennie AI"}
          </button>

          {response && (
            <div className="mt-6 border rounded-xl p-4 bg-gray-50">
              {response}
            </div>
          )}

        </div>

      </div>
    </main>
  );
}