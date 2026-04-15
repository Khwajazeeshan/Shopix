"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, ShoppingCart, User, Menu, X, Store, LayoutDashboard, Heart, Bell, Package } from "lucide-react";
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
        <header className="sticky top-0 z-[150] w-full glass">
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
                                        <Link href="/products/my-orders" className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors group" title="My Orders">
                                            <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                    <div className="flex items-center md:hidden gap-2">
                        <ThemeToggle />
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="p-2 text-foreground h-10 w-10 flex items-center justify-center hover:bg-muted rounded-xl transition-all active:scale-95 border border-border/50"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl shadow-2xl absolute w-full inset-x-0 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <nav className="px-6 py-8 space-y-6">
                        <div className="flex flex-col space-y-4">
                            {!user ? (
                                <>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-4 opacity-50">Account Access</h4>
                                        <Link 
                                            href="/auth/login" 
                                            className="flex items-center justify-between w-full text-lg font-extrabold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Login
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>
                                        <Link 
                                            href="/auth/signup" 
                                            className="flex items-center justify-center w-full text-lg font-black bg-primary text-white text-center px-4 py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-4 opacity-50">Your Activity</h4>
                                         {/* <div className="h-px bg-border/50 w-full my-4"></div> */}

                                        <Link 
                                            href="/auth/profile" 
                                            className="flex items-center justify-between w-full text-base font-bold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-primary" />
                                                    )}
                                                </div>
                                                <span>My Profile</span>
                                            </div>
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>
                                        <Link 
                                            href="/notifications" 
                                            className="flex items-center justify-between w-full text-base font-bold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Bell className="w-5 h-5 text-primary" />
                                                    {unreadNotifications > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white ring-2 ring-background">
                                                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>Notifications</span>
                                            </div>
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>

                                        <Link 
                                            href="/cart" 
                                            className="flex items-center justify-between w-full text-base font-bold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <ShoppingCart className="w-5 h-5 text-primary" />
                                                <span>Shopping Cart</span>
                                            </div>
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>

                                        <Link 
                                            href="/wishlist" 
                                            className="flex items-center justify-between w-full text-base font-bold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Heart className="w-5 h-5 text-primary" />
                                                <span>My Wishlist</span>
                                            </div>
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>

                                        <Link 
                                            href="/products/my-orders" 
                                            className="flex items-center justify-between w-full text-base font-bold text-foreground px-4 py-4 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Package className="w-5 h-5 text-primary" />
                                                <span>My Orders</span>
                                            </div>
                                            <Menu className="w-4 h-4 opacity-20" />
                                        </Link>

                                       

                                        {user.role === "seller" && (
                                            <Link 
                                                href={hasStore ? "/store/dashboard" : "/store/create"} 
                                                className="flex items-center gap-4 w-full text-base font-black bg-secondary text-primary px-4 py-4 rounded-2xl transition-all mt-4"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Store className="w-5 h-5" />
                                                <span>{hasStore ? "Seller Center" : "Launch Your Store"}</span>
                                            </Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}

        </header>
    );
}