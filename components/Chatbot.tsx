"use client";

import React, { useState, useRef, useEffect } from 'react';
import './chat.css'; // Import the newly created CSS

type Message = {
    sender: "bot" | "user";
    text: string;
};

// Lead detection logic ported from Python
function isLeadIntent(message: string): boolean {
    const msg = message.toLowerCase();
    const leadKeywords = [
        "call me",
        "contact me",
        "reach me",
        "talk to someone",
        "inquiry",
        "enquiry",
        "quote",
        "pricing",
        "cost",
        "buy",
        "interested"
    ];

    return leadKeywords.some(keyword => msg.includes(keyword));
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: "bot", text: "Hello! I am your AI assistant. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Lead capturing state machine
    const [leadMode, setLeadMode] = useState(false);
    const [leadStep, setLeadStep] = useState<"name" | "phone" | "query" | "email" | null>(null);
    const [leadData, setLeadData] = useState<Record<string, string>>({});

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    };

    const scrollToBottom = () => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const sendMessage = async () => {
        const text = inputValue.trim();
        if (!text) return;

        // Optimistically add user message
        setMessages(prev => [...prev, { sender: "user", text }]);
        setInputValue("");
        setIsTyping(true);

        // State Machine checking
        let responseText = "";
        let newLeadMode = leadMode;
        let newLeadStep = leadStep;
        let newLeadData = { ...leadData };
        let finishedLead = false;

        // Check for new lead intent if not already in lead mode
        if (isLeadIntent(text) && !leadMode) {
            newLeadMode = true;
            newLeadStep = "name";
            newLeadData = {};
            responseText = "Sure! I'd be happy to help 😊 May I know your name?";
        } else if (leadMode) {
            if (leadStep === "name") {
                newLeadData.name = text;
                newLeadStep = "phone";
                responseText = `Thanks ${text}! Could you share your phone number so our team can call you?`;
            } else if (leadStep === "phone") {
                newLeadData.phone = text;
                newLeadStep = "query";
                responseText = "Great! What is your inquiry about?";
            } else if (leadStep === "query") {
                newLeadData.query = text;
                newLeadStep = "email";
                responseText = "Perfect. Lastly, please share your email address.";
            } else if (leadStep === "email") {
                newLeadData.email = text;
                finishedLead = true;
                responseText = "Thank you! Our team will contact you shortly.";
            }
        }

        // Apply state updates
        setLeadMode(newLeadMode);
        setLeadStep(newLeadStep);
        setLeadData(newLeadData);

        if (responseText) {
            // It's part of the lead flow
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: "bot", text: responseText }]);
                setIsTyping(false);

                // If lead flow is completed trigger webhook
                if (finishedLead) {
                    fetch("/api/webhook", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newLeadData)
                    }).catch(err => console.error("Error saving lead:", err));

                    // Reset lead state
                    setLeadMode(false);
                    setLeadStep(null);
                    setLeadData({});
                }
            }, 800);
            return;
        }

        // If not lead mode, use AI endpoints
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { sender: "bot", text: data.reply || "Sorry, I couldn't reply." }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: "bot", text: "🔌 Sorry, there was an error connecting to the server." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <button
                className="chat-toggle-btn"
                id="chatToggleBtn"
                onClick={toggleChat}
                aria-label="Toggle Chat"
                style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
                {!isOpen ? (
                    <svg viewBox="0 0 24 24" className="chat-icon">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" className="close-icon" style={{ display: 'block' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                )}
            </button>

            <div className={`chat-container ${isOpen ? 'open' : ''}`} id="chatContainer">
                <div className="chat-header">
                    <div className="avatar">✨</div>
                    <div className="info">
                        <h2>AI Automation</h2>
                        <p><span className="status-dot"></span> Online</p>
                    </div>
                    <button className="header-close-btn" onClick={toggleChat} aria-label="Close Chat">
                        <svg viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="chatbox" id="chatbox" ref={chatboxRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="typing-indicator" id="typing-indicator" style={{ display: 'flex' }}>
                            <span></span><span></span><span></span>
                        </div>
                    )}
                </div>

                <div className="input-area">
                    <div className="input-container">
                        <input
                            type="text"
                            id="input"
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') sendMessage();
                            }}
                            autoComplete="off"
                            ref={inputRef}
                        />
                    </div>
                    <button className="send-btn" onClick={sendMessage} aria-label="Send Message" title="Send">
                        <svg viewBox="0 0 24 24">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}
