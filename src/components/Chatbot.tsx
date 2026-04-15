"use client"
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiUser, FiBox } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, isTyping, mounted]);

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

    if (!mounted || pathname !== '/') return null;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end pointer-events-none font-sans">
            {/* Chat Window */}
            <div className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right mb-4 
                w-[calc(100vw-2rem)] xs:w-[340px] sm:w-[400px] 
                bg-surface/80 backdrop-blur-2xl border border-white/20 dark:border-white/5 
                shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden flex flex-col 
                ${isOpen ? 'scale-100 opacity-100 h-[550px] max-h-[75vh] translate-y-0' : 'scale-50 opacity-0 h-0 translate-y-20 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="bg-gradient-to-br from-primary via-primary to-primary-foreground p-6 flex items-center justify-between text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] opacity-100 group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg group-hover:bg-white/30 transition-colors duration-300">
                            <FiMessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight leading-tight">Shopix AI</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/70">Always Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all active:scale-90 relative z-10 border border-transparent hover:border-white/20 group/close">
                        <FiMinimize2 className="w-5 h-5 group-hover/close:rotate-6" />
                    </button>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto hidden-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px] flex flex-col gap-6">
                    {chat.length === 0 && (
                        <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-[30px] mx-auto mb-6 shadow-inner ring-1 ring-primary/20">
                                <FiMessageSquare className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-foreground mb-3 tracking-tight">Smart Assistant</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed px-6 font-medium">
                                ask me about product recommendations, orders, or current top-tier deals.
                            </p>
                        </div>
                    )}

                    {chat.map((msg, i) => (
                        <div key={i} className={`flex gap-2 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                            <div className={`w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center border transition-transform duration-300 hover:scale-110 ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 shadow-lg shadow-primary/20' : 'bg-surface text-primary border-border/50 shadow-md'}`}>
                                {msg.role === 'user' ? <FiUser className="w-4.5 h-4.5" /> : <FiBox className="w-4.5 h-4.5" />}
                            </div>
                            <div className={`p-4 rounded-[1.5rem] text-[13px] leading-relaxed font-medium shadow-sm border transition-all hover:shadow-md ${
                                msg.role === 'user' 
                                ? 'bg-gradient-to-br from-primary via-primary to-primary-foreground text-white border-transparent rounded-tr-none' 
                                : 'bg-surface/90 backdrop-blur-md border-border/50 text-foreground rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 max-w-[85%] self-start animate-in fade-in duration-300">
                             <div className="w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center border bg-surface text-primary border-border/50 shadow-md">
                                <FiBox className="w-4.5 h-4.5" />
                            </div>
                            <div className="px-5 py-4 rounded-[1.5rem] bg-surface/90 backdrop-blur-md border border-border/50 rounded-tl-none shadow-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-surface/95 backdrop-blur-xl border-t border-border group/input transition-colors duration-300 focus-within:bg-surface">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="type a message..."
                                className="w-full bg-background/50 border border-border/50 rounded-2xl pl-5 pr-5 py-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm text-foreground font-medium placeholder:text-muted-foreground/50 shadow-inner"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!message.trim() || isTyping} 
                            className="w-12 h-12 bg-foreground text-background flex items-center justify-center rounded-2xl hover:bg-foreground/90 transition-all hover:shadow-xl active:scale-90 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none group"
                        >
                            <FiSend className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`pointer-events-auto flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all duration-500 hover:scale-110 active:scale-95 group relative ${
                    isOpen 
                    ? 'w-14 h-14 rounded-2xl bg-surface border border-border text-foreground hover:bg-muted' 
                    : 'w-18 h-18 rounded-[2rem] bg-primary text-white hover:bg-primary/90'
                }`}
            >
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isOpen ? <FiX className="w-6 h-6 animate-in zoom-in spin-in duration-300" /> : <FiMessageSquare className="w-8 h-8 animate-in zoom-in duration-500" />}
            </button>
        </div>

    );
};

export default Chatbot;
