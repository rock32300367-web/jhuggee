import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { history, message } = await req.json();

        const apiKey = process.env.CHATBOT_GEMINI_KEY;
        console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!apiKey) {
            return NextResponse.json({ reply: "Internal Error: Gemini API key not found. Please contact support." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // The system instruction to tell the bot exactly how to behave.
        const SYSTEM_PROMPT = `You are a helpful and polite customer support assistant for Jhuggee.
Your goal is to answer users' questions politely and gather their details if they want to make an inquiry, get a demo, discuss pricing, or need further support.
When a user wants to make a formal inquiry, ask for their Name, Email, Phone Number, and their specific Query.
Once you have collected all 4 pieces of information (Name, Email, Phone, Query), you MUST output ONLY a JSON object in the exact following format, and nothing else (no markdown blocks, no intro, no outro):
{
  "__INQUIRY_READY__": true,
  "name": "<their name>",
  "email": "<their email>",
  "phone": "<their phone number>",
  "query": "<their query>"
}
If you do not have all 4 pieces of information yet, just converse normally and ask for the missing ones politely.`;

        // Init model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: history.map((h: any) => ({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }]
            })),
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        try {
            // Check if it's the JSON inquiry ready
            // Remove possible markdown formatting from Gemini response
            let cleanedText = responseText.trim();
            if (cleanedText.startsWith("\`\`\`json")) cleanedText = cleanedText.replace("\`\`\`json", "");
            if (cleanedText.startsWith("\`\`\`")) cleanedText = cleanedText.replace("\`\`\`", "");
            if (cleanedText.endsWith("\`\`\`")) cleanedText = cleanedText.slice(0, -3).trim();

            const parsed = JSON.parse(cleanedText);
            if (parsed.__INQUIRY_READY__) {
                // Send to n8n Webhook
                if (n8nWebhookUrl) {
                    await fetch(n8nWebhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: parsed.name,
                            email: parsed.email,
                            phone: parsed.phone,
                            query: parsed.query,
                            timestamp: new Date().toISOString()
                        })
                    });
                }

                return NextResponse.json({
                    reply: "Thank you! I have successfully forwarded your inquiry to our team. They will contact you shortly."
                });
            }
        } catch (err) {
            // It's not JSON, so it's a regular text response
            return NextResponse.json({ reply: responseText });
        }

        return NextResponse.json({ reply: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ reply: "Sorry, I am facing a technical issue connecting to my brain right now. Please try again later." }, { status: 500 });
    }
}
