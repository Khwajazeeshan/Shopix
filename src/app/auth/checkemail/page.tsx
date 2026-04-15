"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 text-primary rounded-[30px] mb-10 shadow-inner shadow-primary/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                <Mail className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">Check Your Inbox</h1>
            <p className="text-muted-foreground text-sm sm:text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                We've sent a <strong className="text-primary font-black">{type === "signup" ? "verification" : "recovery"}</strong> link to your email. 
                Please follow the steps to continue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                    href="https://mail.google.com"
                    target="_blank"
                    className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] active:scale-[0.98] flex justify-center items-center gap-2 group"
                >
                    Open Gmail 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    href="/auth/login"
                    className="w-full sm:w-auto px-10 py-4 bg-background/50 border border-border/50 text-foreground font-bold rounded-2xl hover:bg-muted transition-all active:scale-[0.98] flex justify-center items-center gap-2 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
            </div>

            <p className="text-[11px] font-medium text-muted-foreground mt-12 uppercase tracking-[0.2em] opacity-60">
                Didn't get the code? Check spam or <button className="text-primary font-bold hover:underline underline-offset-4">Resend</button>
            </p>
        </div>

    );
}

export default function CheckEmail() {
    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] dark:opacity-[0.05]" />

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-surface/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] px-6 py-12 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                    <Suspense fallback={
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-foreground animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing...</h2>
                        </div>
                    }>
                        <CheckEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>

    );
}

