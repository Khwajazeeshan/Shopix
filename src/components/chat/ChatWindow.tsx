"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { pusherClient } from "@/src/lib/pusher";
import { X, Send, MessageSquare, Dot, User, ShoppingBag, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface Message {
  _id: string;
  senderId: string;
  senderRole: "customer" | "seller";
  message: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  productInfo: {
    name: string;
    image: string;
    price: number;
  };
  sellerInfo: {
    name: string;
    image: string;
  };
  currentUserRole: "customer" | "seller";
  onClose: () => void;
}

export default function ChatWindow({
  conversationId,
  productInfo,
  sellerInfo,
  currentUserRole,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${conversationId}`);
        if (response.data.success) {
          setMessages(response.data.messages);
          // Mark as read
          await axios.patch(`/api/chat/${conversationId}`);
        }
      } catch (error) {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(`conversation-${conversationId}`);
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    });

    return () => {
      pusherClient.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await axios.post(`/api/chat/${conversationId}`, {
        message: inputMessage,
        senderRole: currentUserRole,
      });

      if (response.data.success) {
        setInputMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed top-2 right-2 bottom-2 left-2 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-[400px] h-auto sm:h-[500px] sm:max-h-[85vh] bg-background/80 sm:bg-surface/90 backdrop-blur-2xl border border-border sm:rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-5 fade-in duration-500 rounded-2xl">
      {/* Header */}
      <div className="bg-primary px-4 py-3 sm:p-4 text-white flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
            {sellerInfo.image ? (
              <img src={sellerInfo.image} alt="Seller" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-sm sm:text-lg">
                {sellerInfo.name[0]}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-primary rounded-full" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-xs sm:text-sm leading-tight truncate">{sellerInfo.name}</h3>
            <p className="text-[8px] sm:text-[10px] text-white/70 flex items-center gap-0.5 uppercase tracking-widest font-black">
              <Dot className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Product Context - Nano-Style */}
      <div className="px-4 py-2 bg-muted/20 border-b border-border/40 flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-zinc-900 rounded-md overflow-hidden border border-border/50 shrink-0">
          <img src={productInfo.image} alt="Product" className="object-cover w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-primary truncate leading-none mb-0.5">{productInfo.name}</p>
          <p className="text-[10px] font-black text-foreground">Rs. {productInfo.price.toLocaleString()}</p>
        </div>
        <div className="px-2 py-1 bg-primary/10 rounded text-[8px] font-black text-primary uppercase tracking-tighter">
            Regarding
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface/50">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="p-3 bg-muted rounded-full">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">Ask the seller about this product!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm text-xs sm:text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-surface border border-border text-foreground rounded-tl-none font-medium"
                  }`}
                >
                  <p className="leading-relaxed break-words">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "text-white/60" : "text-muted-foreground/60"} text-[8px] sm:text-[9px] font-black`}>
                    <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-muted/10 border-t border-border/40 safe-area-bottom">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-surface border border-border rounded-full pl-4 pr-10 py-2.5 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-30 active:scale-90"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
