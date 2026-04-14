"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle, Clock, ArrowLeft, ArrowRight, Info, Package, Store as StoreIcon, ShieldAlert } from "lucide-react"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"
import Loader from "@/src/components/Loader"

interface Notification {
    _id: string;
    message: string;
    type: "order" | "return" | "store" | "system" | "admin";
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const router = useRouter()

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("/api/notifications")
            if (response.data.success) {
                setNotifications(response.data.data)
            }
        } catch (error: any) {
            if (error.response?.status !== 401) {
                toast.error("Failed to fetch notifications")
            }
        } finally {
            setLoading(false)
        }
    }

    const markAllAsRead = async () => {
        try {
            const response = await axios.patch("/api/notifications/mark-all-read")
            if (response.data.success) {
                toast.success("All caught up!")
                setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })))
            }
        } catch (error) {
            toast.error("Failed to update notifications")
        }
    }

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            try {
                await axios.patch(`/api/notifications/${notif._id}`)
                setNotifications(notifications.map((n: any) => 
                    n._id === notif._id ? { ...n, isRead: true } : n
                ))
            } catch (error) {
                console.error("Mark read failed", error)
            }
        }
        if (notif.link) {
            let sanitizedLink = notif.link;
            const messageLower = notif.message.toLowerCase();
            
            // Map old broken links to new correct ones using message context
            if (sanitizedLink === "/orders") {
                if (messageLower.includes("new order received") || 
                    messageLower.includes("return request received") || 
                    messageLower.includes("customer")) {
                    sanitizedLink = "/store/track-orders";
                } else {
                    sanitizedLink = "/products/my-orders";
                }
            } else if (sanitizedLink === "/store/returns") {
                sanitizedLink = "/store/return-orders";
            }
            router.push(sanitizedLink);
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case "order": return <Package className="w-5 h-5 text-blue-500" />
            case "return": return <Clock className="w-5 h-5 text-orange-500" />
            case "store": return <StoreIcon className="w-5 h-5 text-purple-500" />
            case "admin": return <ShieldAlert className="w-5 h-5 text-red-500" />
            default: return <Info className="w-5 h-5 text-primary" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <button 
                            onClick={() => router.back()} 
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                            Notifications <Bell className="w-6 h-6 text-primary" />
                        </h1>
                    </div>
                    {notifications.length > 0 && notifications.some((n: any) => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium text-sm rounded-full transition-all border border-primary/20"
                        >
                            <CheckCircle className="w-4 h-4" /> Mark all as read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-surface border border-dashed border-border rounded-3xl shadow-sm">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bell className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">You're all caught up!</h3>
                        <p className="text-muted-foreground max-w-sm">
                            When you get updates about your orders, returns, or store status, they'll show up here.
                        </p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="divide-y divide-border">
                            {notifications.map((notif: any) => (
                                <div 
                                    key={notif._id} 
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-5 sm:p-6 transition-all cursor-pointer hover:bg-muted/30 relative group ${!notif.isRead ? "bg-primary/5" : ""}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform ${!notif.isRead ? "ring-2 ring-primary/20" : ""}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                                    notif.type === 'order' ? 'text-blue-500' :
                                                    notif.type === 'admin' ? 'text-red-500' :
                                                    'text-primary'
                                                }`}>
                                                    {notif.type} notification
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-base leading-relaxed ${!notif.isRead ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-5 h-5 text-primary" />
                                        </div>
                                        {!notif.isRead && (
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
