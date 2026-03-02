"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
        { role: "bot", content: "Hi there! Welcome to Jhuggee. I'm here to help. How can I assist you today? Would you like to make an inquiry?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        const newHistory = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newHistory);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(1).map(m => ({ role: m.role, content: m.content })) // exclude first greeting
                }),
            });

            const data = await res.json();
            if (data.reply) {
                setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
            } else {
                setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I encountered an error." }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I can't reach the server right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 ${isOpen ? 'hidden' : 'block'}`}
            >
                <MessageCircle size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200" style={{ height: '500px', maxHeight: '80vh' }}>
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MessageCircle size={20} />
                            Jhuggee Support
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`max-w-[85%] p-3 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="max-w-[80%] p-3 rounded-2xl bg-white border border-gray-200 text-gray-400 self-start rounded-bl-none shadow-sm text-sm flex gap-1 items-center h-[46px]">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t flex gap-2 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition text-black"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 text-white rounded-full p-2.5 flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
