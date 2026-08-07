"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type Lead = {
  name: string;
  email: string;
  phone: string;
  intent: string;
  propertyType: string;
  location: string;
  budget: string;
  timeline: string;
  summary: string;
  leadScore: string;
  nextAction: string;
};

const emptyLead: Lead = {
  name: "",
  email: "",
  phone: "",
  intent: "",
  propertyType: "",
  location: "",
  budget: "",
  timeline: "",
  summary: "",
  leadScore: "",
  nextAction: "",
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lead, setLead] = useState<Lead>(emptyLead);

  const [chat, setChat] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hi! 👋 I'm Jennie, your AI real estate assistant. Are you looking to buy, sell, rent, or just have a few questions?",
    },
  ]);

  const leadId = useRef(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, isTyping]);

  const sendMessage = async () => {
    if (isTyping) return;

    const userText = message.trim();

    if (!userText) return;

    const updatedHistory: ChatMessage[] = [
      ...chat,
      {
        sender: "user",
        text: userText,
      },
    ];

    setChat(updatedHistory);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          history: updatedHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text:
              data.answer ||
              "Something went wrong. Please try again.",
          },
        ]);

        return;
      }

      if (data.lead) {
        const extractedInfo = Object.fromEntries(
          Object.entries(data.lead).filter(
            ([, value]) =>
              typeof value === "string" &&
              value.trim() !== ""
          )
        ) as Partial<Lead>;

        const updatedLead: Lead = {
          ...lead,
          ...extractedInfo,
        };

        setLead(updatedLead);

        const hasContactInfo = Boolean(
          updatedLead.email.trim() ||
            updatedLead.phone.trim()
        );

        const qualificationDetails = [
          updatedLead.propertyType,
          updatedLead.location,
          updatedLead.budget,
          updatedLead.timeline,
        ].filter((value) => value.trim() !== "");

        const isQualifiedLead =
          updatedLead.name.trim() !== "" &&
          hasContactInfo &&
          updatedLead.intent.trim() !== "" &&
          qualificationDetails.length >= 2;

        if (isQualifiedLead) {
          const leadRes = await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: leadId.current,
              ...updatedLead,
              conversation: updatedHistory,
            }),
          });

          if (!leadRes.ok) {
            console.error("Lead saving failed.");
          }
        }
      }

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "No response.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Connection failed.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3efe9] p-0 text-[#252321] sm:p-5">
      <div className="flex h-screen w-full max-w-3xl flex-col overflow-hidden bg-[#fffdf9] sm:h-[760px] sm:rounded-[28px] sm:border sm:border-[#e6dfd6] sm:shadow-[0_24px_70px_rgba(71,58,44,0.14)]">
        <header className="border-b border-[#ebe5dc] bg-[#fffdf9] px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2d2925] text-sm font-bold tracking-wide text-white">
                JA
              </div>

              <div>
                <h1 className="font-semibold tracking-tight text-[#252321]">
                  Jennie AI
                </h1>

                <div className="mt-1 flex items-center gap-2 text-xs text-[#7b756d]">
                  <span className="h-2 w-2 rounded-full bg-[#6f8c75]" />
                  Real Estate Assistant
                </div>
              </div>
            </div>

            <div className="rounded-full border border-[#ded7ce] bg-[#f7f3ed] px-3 py-1.5 text-xs font-medium text-[#777069]">
              Online
            </div>
          </div>
        </header>

        <div className="border-b border-[#ebe5dc] bg-[#f8f4ee] px-5 py-3 text-xs leading-5 text-[#6f675f] sm:px-6">
          By continuing, you agree that information you share may
          be saved and sent to Jennie Artajo so she can follow up
          with you. Please avoid sharing sensitive financial or
          personal information.
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-[#fbf8f4] p-5 sm:p-6">
          {chat.map((msg, index) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={index}
                className={`flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[88%] items-end gap-2.5 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                      isUser
                        ? "bg-[#2d2925] text-white"
                        : "border border-[#ded7ce] bg-[#f0ebe4] text-[#6f655a]"
                    }`}
                  >
                    {isUser ? "You" : "JA"}
                  </div>

                  <div>
                    <div
                      className={`mb-1.5 text-[11px] font-medium ${
                        isUser
                          ? "text-right text-[#7a7168]"
                          : "text-[#8a8177]"
                      }`}
                    >
                      {isUser ? "You" : "Jennie AI"}
                    </div>

                    <div
                      className={`whitespace-pre-wrap rounded-[20px] px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "rounded-br-md bg-[#2d2925] text-white"
                          : "rounded-bl-md border border-[#e3ddd5] bg-[#f2eee8] text-[#393531]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#ded7ce] bg-[#f0ebe4] text-[11px] font-bold text-[#6f655a]">
                  JA
                </div>

                <div>
                  <div className="mb-1.5 text-[11px] font-medium text-[#8a8177]">
                    Jennie AI
                  </div>

                  <div className="rounded-[20px] rounded-bl-md border border-[#e3ddd5] bg-[#f2eee8] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#9f9589]" />

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-[#9f9589]"
                        style={{ animationDelay: "0.15s" }}
                      />

                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-[#9f9589]"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#e7e0d7] bg-[#fffdf9] p-4 sm:px-5">
          <div className="flex items-end gap-3">
            <textarea
              value={message}
              maxLength={1000}
              rows={1}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message Jennie..."
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-[#ddd5cb] bg-[#faf7f2] px-4 py-3 text-sm text-[#2b2825] outline-none transition placeholder:text-[#a49a90] focus:border-[#a68a64] focus:ring-2 focus:ring-[#a68a64]/10"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={isTyping || !message.trim()}
              className="flex h-12 items-center justify-center rounded-2xl bg-[#2d2925] px-5 text-sm font-semibold text-white transition hover:bg-[#453f39] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[#9d9389]">
            <span>Press Enter to send</span>
            <span>{message.length}/1000</span>
          </div>
        </div>
      </div>
    </main>
  );
}