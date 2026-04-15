"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    const verifyToken = useCallback(async () => {
        if (!token) {
            setVerifying(false);
            return;
        }
        try {
            const response = await axios.post("/api/auth/verifyemail", { token });
            if (response.data.type === "verify") {
                setVerified(true);
                toast.success("Email verified successfully!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    }, [token]);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center mb-10">
                {verifying ? (
                    <div className="w-24 h-24 rounded-[30px] bg-primary/10 text-primary flex items-center justify-center relative shadow-inner shadow-primary/20">
                        <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-[30px] animate-spin" />
                        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
                    </div>
                ) : verified ? (
                    <div className="w-24 h-24 rounded-[30px] bg-green-500/10 text-green-500 flex items-center justify-center shadow-inner shadow-green-500/20 relative group">
                        <div className="absolute inset-0 bg-green-500/20 rounded-[30px] animate-ping opacity-20" />
                        <CheckCircle2 className="w-14 h-14 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-[30px] bg-destructive/10 text-destructive flex items-center justify-center shadow-inner shadow-destructive/20 relative group">
                        <div className="absolute inset-0 bg-destructive/20 rounded-[30px] animate-ping opacity-20" />
                        <XCircle className="w-14 h-14 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                {verifying ? "Verifying..." : verified ? "Identity Verified" : "Access Denied"}
            </h1>

            <p className="text-muted-foreground text-sm sm:text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                {verifying
                    ? "Securing your connection and validating credentials."
                    : verified
                        ? "Your account is now fully activated. Dive into the premium Marketplace experience."
                        : "This security token has expired or is cryptographically invalid."}
            </p>

            <Link
                href={verified ? "/auth/login" : "/auth/signup"}
                className={`w-full sm:w-auto px-10 py-4 font-black text-sm sm:text-base rounded-2xl transition-all shadow-lg active:scale-[0.98] flex justify-center items-center gap-2 group mx-auto ${
                    verified 
                        ? "bg-primary text-white hover:bg-primary/90 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)]" 
                        : "bg-background/50 border border-border/50 text-foreground hover:bg-muted"
                }`}
            >
                {verified ? (
                    <>
                        <span>Continue to Workspace</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                ) : (
                    <>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Request New Link</span>
                    </>
                )}
            </Link>

            <p className="text-[11px] font-medium text-muted-foreground mt-12 uppercase tracking-[0.2em] opacity-60">
                Security Protocol v2.4.0 • Encrypted Connection
            </p>
        </div>

    );
}

export default function VerifyEmail() {
    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/15 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] dark:opacity-[0.05]" />

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-surface/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] px-6 py-12 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                    <Suspense fallback={
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-foreground animate-pulse uppercase tracking-[0.2em] text-[10px]">Verifying identity...</h2>
                        </div>
                    }>
                        <VerifyEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>

    );
}

