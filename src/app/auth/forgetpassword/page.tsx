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
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 py-10">
                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary/5 mt-8 relative">
                    <Link 
                        href="/" 
                        className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                        title="Back to Home"
                    >
                        <X className="w-5 h-5" />
                    </Link>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6 mx-auto shadow-inner shadow-primary/20">
                            <KeyRound className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reset Password</h1>
                        <p className="text-muted-foreground">Enter your email for a recovery link.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2 focus-within:text-primary transition-colors">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    placeholder="name@example.com"
                                    className={`w-full bg-background border rounded-xl pl-12 pr-4 py-3.5 outline-none transition-all text-foreground ${
                                        errors.email ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
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
                            {errors.email?.message && <p className="text-destructive text-xs mt-1.5 ml-1">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-foreground text-background font-bold text-base rounded-xl hover:bg-foreground/90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">Remembered your password? </span>
                        <Link href="/auth/login" className="text-foreground font-semibold hover:text-primary transition-colors underline underline-offset-4">
                            Log back in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}