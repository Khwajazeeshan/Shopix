"use client";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { ArrowLeft, ShoppingBag, X } from "lucide-react";

type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    acceptedTerms: boolean;
};

export default function Signup() {
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const [modalType, setModalType] = React.useState<"terms" | "privacy">("terms");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            if (data.password !== data.confirmPassword) {
                return toast.error("Passwords do not match");
            }
            const response = await axios.post("/api/auth/signup", data);
            if (response.data.success) {
                toast.success(response.data.message);
                window.location.href = "/auth/checkemail?type=signup";
            } else {
                toast.error(response.data.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong during signup");
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] dark:opacity-[0.05]" />

            <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">Create Account</h1>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-[280px] mx-auto">Join the Shopix community and start shopping or selling today.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Full Name</label>
                            <input
                                placeholder="John Doe"
                                className={`w-full bg-background/50 border rounded-2xl px-5 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                    errors.name ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                }`}
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 3, message: "Min 3 characters" },
                                })}
                            />
                            {errors.name?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                                            message: "Invalid email"
                                        }
                                    })}
                                />
                                {errors.email?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Account Role</label>
                                <div className="relative">
                                    <select 
                                        className={`w-full bg-background/50 border rounded-2xl px-5 py-3.5 outline-none transition-all appearance-none text-foreground text-sm sm:text-base ${
                                            errors.role ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        }`}
                                        {...register("role", { required: "Please select a role" })}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="customer">Customer</option>
                                        <option value="seller">Seller</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                    </div>
                                </div>
                                {errors.role?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.role.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full bg-background/50 border rounded-2xl pl-5 pr-12 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                            errors.password ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        }`}
                                        {...register("password", {
                                            required: "Required",
                                            minLength: { value: 6, message: "Min 6 chars" },
                                        })}
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                                {errors.password?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Confirm</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full bg-background/50 border rounded-2xl pl-5 pr-12 py-3.5 outline-none transition-all text-foreground text-sm sm:text-base ${
                                            errors.confirmPassword ? "border-destructive/50 ring-2 ring-destructive/10" : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        }`}
                                        {...register("confirmPassword", { required: "Required" })}
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword?.message && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-start gap-3 ml-1">
                                <div className="flex items-center h-5 mt-1">
                                    <input
                                        type="checkbox"
                                        id="acceptedTerms"
                                        className="w-4 h-4 rounded-lg border-border text-primary focus:ring-primary/20 bg-background transition-all cursor-pointer ring-offset-background"
                                        {...register("acceptedTerms", { required: "Terms must be accepted" })}
                                    />
                                </div>
                                <div className="text-[13px] text-muted-foreground leading-relaxed">
                                    I accept the{" "}
                                    <button 
                                        type="button" 
                                        className="text-primary hover:text-primary/80 font-bold transition-all transition-colors underline underline-offset-4 decoration-primary/30"
                                        onClick={(e) => { e.preventDefault(); setModalType("terms"); setShowTermsModal(true); }}
                                    >
                                        Terms
                                    </button>
                                    {" "}and{" "}
                                    <button 
                                        type="button" 
                                        className="text-primary hover:text-primary/80 font-bold transition-all transition-colors underline underline-offset-4 decoration-primary/30"
                                        onClick={(e) => { e.preventDefault(); setModalType("privacy"); setShowTermsModal(true); }}
                                    >
                                        Privacy
                                    </button>
                                </div>
                            </div>
                            {errors.acceptedTerms?.message && <p className="text-destructive text-[11px] font-medium mt-1.5 ml-8">{errors.acceptedTerms.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 bg-foreground text-background font-black text-sm sm:text-base rounded-2xl hover:bg-foreground/90 transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group mt-4"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : (
                                <>
                                    <span>Get Started</span>
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
                            <span className="px-4 bg-surface/0 backdrop-blur-3xl text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Social Connect</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-4 px-4 border border-border/50 bg-background/50 hover:bg-muted text-foreground font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                        onClick={() => signIn("google", { callbackUrl: "/auth/oauth-callback" })}
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign up with Google</span>
                    </button>

                    <p className="mt-10 text-center text-[13px] text-muted-foreground font-medium">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-primary/30 hover:decoration-primary">
                            Sign In Instead
                        </Link>
                    </p>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowTermsModal(false)} 
                    />
                    <div className="relative bg-background rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col">
                        <div className="p-3 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
                            <h2 className="text-base sm:text-lg font-bold text-foreground">
                                {modalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                            </h2>
                            <button 
                                onClick={() => setShowTermsModal(false)} 
                                className="p-1.5 sm:p-2 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-muted-foreground text-xs sm:text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
                            <p>This is a standard representation of the {modalType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} for Shopix Marketplace.</p>
                            <div className="space-y-3">
                                <p><strong className="text-foreground font-semibold">1. Data Integrity:</strong> We prioritize your cryptographic safety and privacy.</p>
                                <p><strong className="text-foreground font-semibold">2. Transaction Security:</strong> All marketplace logs are immutable and encrypted. Payment info is processed via Stripe securely.</p>
                                <p><strong className="text-foreground font-semibold">3. User Conduct:</strong> By joining, you agree not to use systems for malicious traffic or false representations.</p>
                                <p><strong className="text-foreground font-semibold">4. Liability:</strong> We are not responsible for account leaks due to weak passwords, though we enforce standard restrictions.</p>
                            </div>
                        </div>
                        <div className="p-3 sm:p-5 border-t border-border bg-muted/10 flex justify-end">
                            <button 
                                onClick={() => setShowTermsModal(false)}
                                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-foreground text-background font-semibold text-sm rounded-lg sm:rounded-xl hover:bg-foreground/90 transition-colors"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
