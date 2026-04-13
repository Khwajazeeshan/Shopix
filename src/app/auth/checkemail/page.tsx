"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full mb-8 shadow-inner shadow-primary/20 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                <Mail className="w-10 h-10" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">Check Your Email</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                We've sent a <strong className="text-foreground">{type === "signup" ? "verification" : "recovery"}</strong> link to your inbox.
                Please follow the instructions in the email to proceed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                    href="https://mail.google.com"
                    target="_blank"
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex justify-center items-center gap-2 group"
                >
                    Open Gmail 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    href="/auth/login"
                    className="w-full sm:w-auto px-8 py-3.5 bg-background border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all active:scale-[0.98] flex justify-center items-center gap-2 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Login
                </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-10">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
        </div>
    );
}

export default function CheckEmail() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-primary/5">
                    <Suspense fallback={
                        <div className="text-center py-10">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                            <h2 className="text-lg font-medium text-muted-foreground">Loading...</h2>
                        </div>
                    }>
                        <CheckEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

