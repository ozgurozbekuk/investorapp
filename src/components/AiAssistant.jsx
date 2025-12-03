"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import {
  MessageCircleIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

const suggestions = [
  "Summarize the market in one paragraph.",
  "Give me 3 portfolio risk checks.",
  "What questions should I ask before investing?",
];

const AiAssistant = () => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm your on-page AI. Ask about investing principles, market recaps, or how to improve a post.",
    },
  ]);

  const callApi = async (history) => {
    const response = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error || "AI request failed");
    }

    const data = await response.json();
    return data?.reply || "I couldn't generate a response just now.";
  };

  const handleSend = async (value) => {
    const content = value.trim();
    if (!content || isThinking) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await callApi(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Something went wrong reaching the AI. Please try again.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const chatPreview = useMemo(
    () =>
      messages
        .slice(-2)
        .map((m) => (m.role === "assistant" ? "AI: " : "You: ") + m.content)
        .join(" "),
    [messages]
  );

  return (
    <div
      ref={containerRef}
      className="fixed right-4 bottom-4 z-50 w-[320px] max-w-[90vw]"
    >
      {isOpen ? (
        <Card className="shadow-xl border-0 bg-gradient-to-br from-sky-950 via-blue-900 to-indigo-900 text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-sky-300" />
              <CardTitle className="text-base text-sky-100">AI Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-200 hover:text-white hover:bg-sky-500/20"
              onClick={() => setIsOpen(false)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-64 border border-sky-200/20 rounded-md p-3 bg-white/5 backdrop-blur">
              <div className="space-y-3 text-sm">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[90%] shadow ${
                        message.role === "assistant"
                          ? "bg-sky-500/15 text-slate-50 border border-sky-200/20"
                          : "bg-sky-400 text-slate-900"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="text-xs text-sky-200">Thinking…</div>
                )}
              </div>
            </ScrollArea>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((text) => (
                <Button
                  key={text}
                  variant="outline"
                  size="sm"
                  className="text-xs border-sky-200/30 text-sky-100 hover:bg-sky-500/10"
                  onClick={() => handleSend(text)}
                  disabled={isThinking}
                >
                  {text}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                rows={2}
                placeholder="Ask anything investing-related…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                disabled={isThinking}
                className="bg-sky-500/10 border-sky-200/20 text-slate-50 placeholder:text-slate-200"
              />
              <Button
                disabled={!input.trim() || isThinking}
                onClick={() => handleSend(input)}
                variant="secondary"
                className="w-full gap-2 bg-sky-400 text-slate-900 hover:bg-sky-300"
              >
                <SendIcon className="h-4 w-4" />
                {isThinking ? "Thinking..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full justify-start gap-2 shadow-lg bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500"
          variant="secondary"
        >
          <MessageCircleIcon className="h-4 w-4" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </Button>
      )}
    </div>
  );
};

export default AiAssistant;
