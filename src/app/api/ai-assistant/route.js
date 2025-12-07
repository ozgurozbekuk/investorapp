import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY env variable." },
        { status: 500 }
      );
    }

    const sanitizedMessages = messages
      .filter(
        (m) =>
          m &&
          typeof m.content === "string" &&
          ["system", "user", "assistant"].includes(m.role)
      )
      .map((m) => ({
        role: m.role,
        content: m.content.trim(),
      }));

    const seedSystemPrompt =
      "You are InvestorApp AI, a concise, friendly, real-life assistant. " +
      "Answer clearly, keep responses actionable, and decline unsafe or off-topic requests.";

    const payloadMessages = [
      { role: "system", content: seedSystemPrompt },
      ...sanitizedMessages,
    ];

    if (payloadMessages.length === 1) {
      return NextResponse.json(
        { error: "Please provide at least one user message." },
        { status: 400 }
      );
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: payloadMessages,
      temperature: 0.7,
      max_tokens: 512,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI request failed." },
        { status: response.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({
      reply: reply || "I couldn't generate a response just now.",
    });
  } catch (error) {
    console.error("AI assistant route error:", error);
    return NextResponse.json(
      { error: "Unexpected error in AI assistant." },
      { status: 500 }
    );
  }
}
