"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { pusherClient } from "@/src/lib/pusher";
import { FiArrowLeft, FiMessageCircle, FiSearch, FiClock, FiCheckSquare, FiUser } from "react-icons/fi";
import { MessageSquare, ShoppingBag, Send, Dot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/src/components/Loader";
import { toast } from "react-hot-toast";

interface Conversation {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    image: string;
  };
  sellerId: {
    _id: string;
    name: string;
  };
  productId: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  lastMessage: string;
  unreadCount?: number;
  updatedAt: string;
}

interface Message {
  _id: string;
  senderId: string;
  senderRole: "customer" | "seller";
  message: string;
  createdAt: string;
}

export default function SellerChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get("/api/chat/conversations");
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      
      // Subscribe to Pusher
      const channel = pusherClient.subscribe(`conversation-${selectedChat._id}`);
      channel.bind("new-message", (data: Message) => {
        setMessages((prev) => [...prev, data]);
        // Update last message in the list
        setConversations(prev => prev.map(c => 
          c._id === selectedChat._id ? { ...c, lastMessage: data.message, updatedAt: new Date().toISOString() } : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });

      return () => {
        pusherClient.unsubscribe(`conversation-${selectedChat._id}`);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (convId: string) => {
    setFetchingMessages(true);
    try {
      const response = await axios.get(`/api/chat/${convId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setFetchingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      const response = await axios.post(`/api/chat/${selectedChat._id}`, {
        message: inputMessage,
        senderRole: "seller",
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

  const onSelectChat = async (conv: Conversation) => {
    setSelectedChat(conv);
    // Mark as read in UI immediately
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    try {
        await axios.patch(`/api/chat/${conv._id}`);
    } catch (e) {
        console.error("Failed to mark as read");
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.customerId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full sm:w-80 lg:w-96 border-r border-border flex flex-col bg-surface/50 backdrop-blur-md">
        <div className="p-6 border-b border-border">
          <Link href="/store/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FiMessageCircle className="w-6 h-6 text-primary" /> Messages
          </h1>
          <div className="mt-4 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => onSelectChat(conv)}
                className={`p-4 border-b border-border/50 cursor-pointer transition-all hover:bg-primary/5 ${
                  selectedChat?._id === conv._id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
                    {conv.customerId.image ? (
                      <Image src={conv.customerId.image} alt={conv.customerId.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg text-muted-foreground">
                        {conv.customerId.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={`text-sm text-foreground truncate ${conv.unreadCount && conv.unreadCount > 0 ? "font-black" : "font-bold"}`}>
                        {conv.customerId.name}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-surface font-black mt-1 shadow-sm">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-primary mb-1 truncate flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> {conv.productId.name}
                    </p>
                    <p className={`text-xs truncate ${selectedChat?._id === conv._id ? "text-foreground" : "text-muted-foreground font-medium"}`}>
                      {conv.lastMessage || "Started a conversation"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6 border border-border">
              <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Select a Conversation</h2>
            <p className="text-muted-foreground max-w-sm">Pick a customer message to start replying and boost your sales conversion.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-20 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm">
                  {selectedChat.customerId.image ? (
                    <img src={selectedChat.customerId.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">{selectedChat.customerId.name[0]}</div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-sm sm:text-base">{selectedChat.customerId.name}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium tracking-wide">
                    <Dot className="w-4 h-4 text-green-500 animate-pulse" /> ONLINE &bull; {selectedChat.productId.name}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Product Price</p>
                    <p className="text-sm font-bold text-primary">Rs. {selectedChat.productId.price.toLocaleString()}</p>
                 </div>
                 <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                    <img src={selectedChat.productId.image} alt="P" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 custom-scrollbar">
              {fetchingMessages ? (
                <div className="flex h-full items-center justify-center flex-col gap-3">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-muted-foreground">Loading chat history...</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderRole === "seller";
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-${isMe ? 'right' : 'left'}-2 duration-300`}
                    >
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        <div
                          className={`p-4 rounded-2xl shadow-sm text-sm ${
                            isMe
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-surface border border-border text-foreground rounded-tl-none"
                          }`}
                        >
                          <p className="leading-relaxed font-medium">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <FiClock className="w-2.5 h-2.5" />
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
            <form onSubmit={handleSendMessage} className="p-6 bg-surface border-t border-border shadow-2xl">
              <div className="flex items-center gap-4 bg-background border border-border rounded-2xl pl-4 pr-2 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your professional reply here..."
                  className="flex-1 bg-transparent py-2 outline-none text-sm text-foreground"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Send Reply</span>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                 <FiCheckSquare className="w-3 h-3 text-green-500" /> Messages are encrypted & secure
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
