"use client";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { ArrowLeft, ShoppingBag, X } from "lucide-react";

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [blockedUntil, setBlockedUntil] = React.useState<number | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState<string>("");

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: "/auth/oauth-callback" });
        } catch (error) {
            setIsGoogleLoading(false);
            toast.error("Failed to connect with Google");
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInputs>();

    // Countdown timer logic
    React.useEffect(() => {
        if (blockedUntil) {
            const timer = setInterval(() => {
                const now = Date.now();
                const diff = blockedUntil - now;
                if (diff <= 0) {
                    setBlockedUntil(null);
                    clearInterval(timer);
                } else {
                    const h = Math.floor(diff / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${h}h ${m}m ${s}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [blockedUntil]);

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            const response = await axios.post("/api/auth/login", data);
            if (response.data.success) {
                toast.success(response.data.message);
                window.location.href = "/";
            } else {
                toast.error(response.data.message);
            }
        } catch (error: any) {
            if (error.response?.status === 429) {
                const reset = error.response.data.reset;
                if (reset) {
                    setBlockedUntil(reset);
                }
                toast.error(error.response.data.message || "Too many attempts. Try again later.");
            } else {
                toast.error(error.response?.data?.message || "Something went wrong");
            }
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
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
                        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-[20px] mb-6 shadow-[0_10px_20px_-5px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-300">
                            <ShoppingBag className="w-8 h-8" />
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">Welcome Back</h1>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-[260px] mx-auto">Sign in to your account and explore the best deals.</p>
                    </div>

                    {blockedUntil && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl mb-8 text-center animate-in fade-in zoom-in duration-500">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Security Lockout</p>
                            <p className="text-xl font-mono font-black">{timeLeft}</p>
                            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-tighter">Too many failed attempts. Try later.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Email Address</label>
                            <input
                                placeholder="name@example.com"
                                className={`w-full bg-background/50 border rounded-2xl px-5 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                    errors.email ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                }`}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest transition-colors group-focus-within:text-primary">Password</label>
                                <Link href="/auth/forgetpassword" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full bg-background/50 border rounded-2xl pl-5 pr-14 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                        errors.password ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" },
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.password.message}</p>}
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
                                    <span>Sign In</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 mb-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-surface/0 backdrop-blur-3xl text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Social Access</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isGoogleLoading}
                        className="w-full py-4 px-4 border border-border/50 bg-background/50 hover:bg-muted text-foreground font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] disabled:opacity-70"
                        onClick={handleGoogleSignIn}
                    >
                        {isGoogleLoading ? (
                             <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>{isGoogleLoading ? "Connecting..." : "Sign in with Google"}</span>
                    </button>

                    <p className="mt-10 text-center text-[13px] text-muted-foreground font-medium">
                        New to Shopix?{" "}
                        <Link href="/auth/signup" className="text-primary font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-primary/30 hover:decoration-primary">
                            Create Free Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>

    );
}
