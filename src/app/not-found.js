"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Animated 404 Text */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 select-none animate-in fade-in zoom-in duration-700">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full" />
        </div>

        {/* Content Card */}
        <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-12 shadow-2xl animate-in slide-in-from-bottom duration-700 delay-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Oops! You've wandered off the map.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto">
            The page you are looking for might have been moved, deleted, or never existed in the Shopix universe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
            >
              <Home className="w-5 h-5" /> Back to Home
            </Link>
            <button 
              onClick={() => window?.history?.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-background border border-border text-foreground rounded-2xl font-semibold hover:bg-muted transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" /> Previous Page
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
              Maybe try one of these?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link href="/cart" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-primary/5 transition-colors group">
                <ShoppingBag className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Your Cart</span>
              </Link>
              <Link href="/wishlist" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-primary/5 transition-colors group">
                <Search className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Wishlist</span>
              </Link>
              <Link href="/notifications" className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-primary/5 transition-colors group">
                <div className="relative">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -top-0.5 -right-0.5" />
                   <Search className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-semibold">Alerts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Decoration */}
        <div className="mt-8 text-sm text-muted-foreground/60 font-medium tracking-wide italic">
          Lost in Space? We'll help you find your way back.
        </div>
      </div>
    </div>
  );
}