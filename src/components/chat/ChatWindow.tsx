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
    if (pusherClient) {
      const channel = pusherClient.subscribe(`conversation-${conversationId}`);
      channel.bind("new-message", (data: Message) => {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      });
    }

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(`conversation-${conversationId}`);
      }
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
    <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-primary p-4 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10">
            {sellerInfo.image ? (
              <img src={sellerInfo.image} alt="Seller" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                {sellerInfo.name[0]}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">{sellerInfo.name}</h3>
            <p className="text-[10px] text-white/70 flex items-center gap-1 uppercase tracking-widest font-semibold">
              <Dot className="w-4 h-4 text-green-400 animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Product Context */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden border border-border flex-shrink-0">
          <img src={productInfo.image} alt="Product" className="object-cover w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Regarding</p>
          <p className="text-xs font-semibold text-foreground truncate">{productInfo.name}</p>
        </div>
        <div className="text-xs font-bold text-primary">
          Rs.{productInfo.price.toLocaleString()}
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
                className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-surface border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1.5 ${isMe ? "text-white/70" : "text-muted-foreground"} text-[9px] font-medium`}>
                    <Clock className="w-2.5 h-2.5" />
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
      <form onSubmit={handleSendMessage} className="p-4 bg-surface border-t border-border">
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-muted/50 border border-border rounded-2xl pl-4 pr-12 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
