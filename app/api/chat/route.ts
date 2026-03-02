import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBaMOofLRExZrB5VgXy7nmtK5OTwC_6daM";
const MODEL_NAME = "gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `
You are a friendly business assistant.

Keep responses short, warm, and natural.
Sound human-like.
Never give long lectures.
Focus only on business-related conversations.
`;

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const data = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: SYSTEM_PROMPT },
                        { text: message }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topP: 0.8,
                maxOutputTokens: 300
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            // Next.js fetch API doesn't use standard timeout like axios/requests, but we can assume it will resolve.
        });

        if (!response.ok) {
            console.error("Gemini API Error:", await response.text());
            return NextResponse.json({ reply: "Sorry, something went wrong. Please try again." });
        }

        const result = await response.json();
        const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        return NextResponse.json({ reply: replyText });
    } catch (error) {
        console.error("LLM Exception:", error);
        return NextResponse.json({ reply: "System temporarily unavailable." }, { status: 500 });
    }
}
