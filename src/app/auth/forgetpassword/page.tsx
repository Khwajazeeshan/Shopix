"use client";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";

type ForgetInputs = {
    email: string;
};

export default function ForgetPassword() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgetInputs>();

    const onSubmit = async (data: ForgetInputs) => {
        try {
            const response = await axios.post("/api/auth/forgetpassword", data);
            if (response.data.success) {
                toast.success(response.data.message);
                router.push("/auth/checkemail?type=reset");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/15 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] dark:opacity-[0.05]" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-surface/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] px-6 py-10 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative">
                    <Link 
                        href="/" 
                        className="absolute top-6 right-6 p-2.5 rounded-2xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-300 border border-transparent hover:border-border/50 group"
                        title="Back to Home"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </Link>

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-[22px] mb-6 mx-auto shadow-inner shadow-primary/20 hover:scale-105 transition-transform duration-300">
                            <KeyRound className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">Reset Password</h1>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-[260px] mx-auto">No worries! Enter your email and we'll send you a recovery link.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                                <input
                                    placeholder="name@example.com"
                                    className={`w-full bg-background/50 border rounded-2xl pl-12 pr-5 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                        errors.email ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email"
                                        }
                                    })}
                                />
                            </div>
                            {errors.email?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-foreground text-background font-black text-sm sm:text-base rounded-2xl hover:bg-foreground/90 transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-[13px] text-muted-foreground font-medium">
                        Remembered your password?{" "}
                        <Link href="/auth/login" className="text-primary font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-primary/30 hover:decoration-primary">
                            Log back in
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
}