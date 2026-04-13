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
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-center mb-8">
                {verifying ? (
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center relative shadow-inner shadow-primary/20">
                        <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                    </div>
                ) : verified ? (
                    <div className="w-24 h-24 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shadow-inner shadow-green-500/20 relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shadow-inner shadow-destructive/20 relative">
                        <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping opacity-20" />
                        <XCircle className="w-12 h-12" />
                    </div>
                )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                {verifying ? "Verifying Email..." : verified ? "Account Verified" : "Verification Failed"}
            </h1>

            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                {verifying
                    ? "Please wait while we securely verify your account."
                    : verified
                        ? "Your email has been successfully verified. You can now access all features of our platform."
                        : "The verification link is invalid or has expired."}
            </p>

            <Link
                href={verified ? "/auth/login" : "/auth/signup"}
                className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex justify-center items-center gap-2 group mx-auto ${
                    verified 
                        ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20" 
                        : "bg-background border border-border text-foreground hover:bg-muted"
                }`}
            >
                {verified ? (
                    <>Continue to Login <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                ) : (
                    <><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Signup</>
                )}
            </Link>
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-primary/5">
                    <Suspense fallback={
                        <div className="text-center py-10">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                            <h2 className="text-lg font-medium text-muted-foreground">Loading verify component...</h2>
                        </div>
                    }>
                        <VerifyEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

