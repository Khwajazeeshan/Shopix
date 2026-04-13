"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, ShoppingCart, User, Menu, X, Store, LayoutDashboard, Heart, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasStore, setHasStore] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get("/api/auth/user");
                if (userRes.data.success) {
                    setUser(userRes.data.data);
                    
                    // Fetch notifications count
                    const notifRes = await axios.get("/api/notifications");
                    if (notifRes.data.success) {
                        setUnreadNotifications(notifRes.data.unreadCount);
                    }

                    if (userRes.data.data.role === "seller") {
                        try {
                            const storeRes = await axios.get("/api/store");
                            if (storeRes.data.success) {
                                setHasStore(true);
                            }
                        } catch (err) {
                            setHasStore(false);
                        }
                    }
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    if (!mounted) return null;

    return (
        <header className="sticky top-0 z-50 w-full glass">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground">Shopix</span>
                        </Link>
                    </div>

                 

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                {!user ? (
                                    <>
                                        <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2">
                                            Log in
                                        </Link>
                                        <Link href="/auth/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                                            Join Shopix
                                        </Link>
                                    </>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        {user.role === "seller" && (
                                            <Link 
                                                href={hasStore ? "/store/dashboard" : "/store/create"} 
                                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 transition-colors"
                                            >
                                                <Store className="w-4 h-4" />
                                                <span>{hasStore ? "My Store" : "Create Store"}</span>
                                            </Link>
                                        )}
                                        {user.role === "admin" && (
                                            <Link 
                                                href="/admin/dashboard" 
                                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>Admin</span>
                                            </Link>
                                        )}
                                        <Link href="/notifications" className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors group">
                                            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            {unreadNotifications > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                                                </span>
                                            )}
                                        </Link>
                                        <Link href="/wishlist" className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors group">
                                            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </Link>
                                        <Link href="/cart" className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors group">
                                            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </Link>
                                        <Link href="/auth/profile" className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-secondary-foreground hover:ring-2 hover:ring-primary/50 transition-all">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </Link>
                                    </div>
                                )}
                                <ThemeToggle />
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center md:hidden">
                        <ThemeToggle />
                        <Link href="/notifications" className="p-2 mr-2 text-foreground relative">
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                                </span>
                            )}
                        </Link>
                        <Link href="/wishlist" className="p-2 mr-2 text-foreground relative">
                            <Heart className="w-5 h-5" />
                        </Link>
                        <Link href="/cart" className="p-2 mr-2 text-foreground relative">
                            <ShoppingCart className="w-5 h-5" />
                        </Link>
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background shadow-lg absolute w-full inset-x-0">
                    <nav className="px-4 py-4 space-y-4">
                       
                        <div className="h-px bg-border w-full my-4"></div>
                        <div className="flex flex-col space-y-3">
                            {!user ? (
                                <>
                                    <Link 
                                        href="/auth/login" 
                                        className="text-base font-medium text-foreground px-2 py-1 hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        href="/auth/signup" 
                                        className="text-base font-medium bg-primary text-primary-foreground text-center px-4 py-2 rounded-md"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user.role === "seller" && (
                                        <Link 
                                            href={hasStore ? "/store/dashboard" : "/store/create"} 
                                            className="flex items-center gap-2 text-base font-medium text-foreground px-2 py-1 hover:text-primary transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Store className="w-5 h-5" />
                                            <span>{hasStore ? "My Store" : "Create Store"}</span>
                                        </Link>
                                    )}
                                    <Link 
                                        href="/auth/profile" 
                                        className="flex items-center gap-2 text-base font-medium text-foreground px-2 py-1 hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        Profile
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}