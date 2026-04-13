"use client"
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiUser, FiBox } from 'react-icons/fi';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = message.trim();
        setMessage('');
        setChat(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);
 
        try {
            const response = await axios.post('/api/chatbot', { question: userMessage });
            if (response.data.success) {
                setChat(prev => [...prev, { role: 'ai', content: response.data.answer }]);
            } else {
                throw new Error(response.data.error);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "I'm experiencing a connectivity issue. Please try again.";
            setChat(prev => [...prev, { role: 'ai', content: errorMsg }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div className={`pointer-events-auto transition-all duration-500 origin-bottom-right mb-4 w-[calc(100vw-3rem)] sm:w-[380px] bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col ${isOpen ? 'scale-100 opacity-100 h-[600px] max-h-[80vh]' : 'scale-50 opacity-0 h-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-primary p-5 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                            <FiMessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Shopix Assistant</h3>
                            <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10">
                        <FiMinimize2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto hidden-scrollbar bg-background flex flex-col gap-4">
                    {chat.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4">
                                <FiMessageSquare className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-foreground mb-2">How can I help you?</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                I'm your AI shopping assistant. Ask me about your orders, product recommendations, or store policies.
                            </p>
                        </div>
                    )}

                    {chat.map((msg, i) => (
                        <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20' : 'bg-surface text-primary border-border shadow-sm'}`}>
                                {msg.role === 'user' ? <FiUser className="w-4 h-4" /> : <FiBox className="w-4 h-4" />}
                            </div>
                            <div className={`p-3.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm shadow-md' : 'bg-surface border border-border text-foreground rounded-tl-sm shadow-sm'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 max-w-[85%] self-start">
                             <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center border bg-surface text-primary border-border shadow-sm">
                                <FiBox className="w-4 h-4" />
                            </div>
                            <div className="p-4 rounded-2xl bg-surface border border-border rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface border-t border-border">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-background border border-border rounded-full pl-5 pr-14 py-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm text-foreground shadow-inner"
                        />
                        <button 
                            type="submit" 
                            disabled={!message.trim() || isTyping} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-white flex items-center justify-center rounded-full hover:bg-primary/90 transition-colors shadow-md disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                        >
                            <FiSend className="w-4 h-4 translate-x-px translate-y-px" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`pointer-events-auto flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'w-12 h-12 rounded-full bg-surface border border-border text-foreground hover:bg-muted' : 'w-16 h-16 rounded-full bg-primary text-white hover:bg-primary/90'}`}
            >
                {isOpen ? <FiX className="w-5 h-5" /> : <FiMessageSquare className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default Chatbot;
