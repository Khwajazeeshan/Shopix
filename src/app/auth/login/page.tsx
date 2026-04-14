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
    const [timeLeft, setTimeLeft] = React.useState<string>("");

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
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary/5 relative">
                    <Link 
                        href="/" 
                        className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                        title="Back to Home"
                    >
                        <X className="w-5 h-5" />
                    </Link>
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center justify-center w-14 h-14 bg-primary text-white rounded-2xl mb-6 shadow-lg shadow-primary/20">
                            <ShoppingBag className="w-7 h-7" />
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to your Shopix account to continue</p>
                    </div>

                    {blockedUntil && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 text-center animate-in fade-in zoom-in duration-300">
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">Access Restricted</p>
                            <p className="text-lg font-mono font-bold">{timeLeft}</p>
                            <p className="text-[10px] opacity-70 mt-1">Too many failed attempts. Try again later.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <input
                                placeholder="name@example.com"
                                className={`w-full bg-background border rounded-xl px-4 py-3 outline-none transition-all text-foreground ${
                                    errors.email ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                }`}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email?.message && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">Password</label>
                                <Link href="/auth/forgetpassword" className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-all">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full bg-background border rounded-xl pl-4 pr-12 py-3 outline-none transition-all text-foreground ${
                                        errors.password ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                    }`}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" },
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password?.message && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-foreground text-background font-bold text-base rounded-xl hover:bg-foreground/90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 mb-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-surface text-muted-foreground font-medium text-xs uppercase tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-3 px-4 border border-border bg-background hover:bg-muted text-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
                        onClick={() => signIn("google", { callbackUrl: "/auth/oauth-callback" })}
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="mt-8 text-center text-sm text-foreground">
                        Don't have an account?{" "}
                        <Link href="/auth/signup" className="text-primary font-bold hover:underline underline-offset-4 transition-all">
                            Join now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
