import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = "https://hyperethical-introvertedly-holley.ngrok-free.dev/webhook/9efbc0ad-3f67-4bb0-b950-79c8a2948115";

export async function POST(req: Request) {
    try {
        const leadData = await req.json();

        // Optional validation
        if (!leadData.name || !leadData.email) {
            return NextResponse.json({ error: "Invalid lead data" }, { status: 400 });
        }

        // Add timestamp as the python backend did
        leadData.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Forward to n8n webhook
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(leadData)
        });

        if (!response.ok) {
            console.error("Webhook error:", await response.text());
        }

        return NextResponse.json({ success: true, message: "Webhook triggered" });
    } catch (error) {
        console.error("Webhook Exception:", error);
        return NextResponse.json({ error: "Failed to trigger webhook" }, { status: 500 });
    }
}
