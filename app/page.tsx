"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = () => {
    if (!question.trim()) {
      setResponse("Please enter a question first.");
      return;
    }

    setResponse(
      `Thanks for your question: "${question}". Jennie AI chat is being connected and will be able to answer this here soon.`
    );
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            Ask Jennie AI
          </h1>

          <p className="text-lg text-gray-600">
            Real Estate Broker • Hablo Español
          </p>

          <p className="mt-4">
            224-388-2478 • JArtajo@StarckRE.com
          </p>
        </div>

        <div className="border rounded-2xl p-6 shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Ask a Question
          </h2>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your real estate question..."
            className="w-full border rounded-xl p-4 mb-4"
          />

          <button
            onClick={handleAsk}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Ask Jennie AI
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