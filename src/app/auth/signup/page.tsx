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
        <div className="min-h-screen relative flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />

            <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 py-4 sm:py-10">
                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl shadow-primary/5 mt-4 sm:mt-8 relative">
                    <Link 
                        href="/" 
                        className="absolute top-3 right-3 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                        title="Back to Home"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <div className="text-center mb-5 sm:mb-8">
                        <Link href="/" className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-primary text-white rounded-xl sm:rounded-2xl mb-3 sm:mb-6 shadow-lg shadow-primary/20">
                            <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7" />
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1 sm:mb-2">Create Account</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">Start your professional journey with Shopix Marketplace.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                        <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-xs sm:text-sm font-medium text-foreground">Full Name</label>
                            <input
                                placeholder="John Doe"
                                className={`w-full bg-background border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none transition-all text-foreground text-sm ${
                                    errors.name ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                }`}
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 3, message: "Min 3 characters" },
                                })}
                            />
                            {errors.name?.message && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-xs sm:text-sm font-medium text-foreground">Email Address</label>
                                <input
                                    placeholder="name@example.com"
                                    className={`w-full bg-background border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none transition-all text-foreground text-sm ${
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
                                {errors.email?.message && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-xs sm:text-sm font-medium text-foreground">Account Role</label>
                                <div className="relative">
                                    <select 
                                        className={`w-full bg-background border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none transition-all appearance-none text-foreground text-sm ${
                                            errors.role ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                        }`}
                                        {...register("role", { required: "Please select a role" })}
                                    >
                                        <option value="" disabled className="text-muted-foreground">Select Role</option>
                                        <option value="customer" className="text-foreground bg-background">Customer</option>
                                        <option value="seller" className="text-foreground bg-background">Seller</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-muted-foreground">
                                        <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                    </div>
                                </div>
                                {errors.role?.message && <p className="text-destructive text-xs mt-1">{errors.role.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-xs sm:text-sm font-medium text-foreground">Password</label>
                                <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full bg-background border rounded-lg sm:rounded-xl pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-3 outline-none transition-all text-foreground text-sm ${
                                            errors.password ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                        }`}
                                        {...register("password", {
                                            required: "Required",
                                            minLength: { value: 6, message: "Min 6 chars" },
                                        })}
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                    </button>
                                </div>
                                {errors.password?.message && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-xs sm:text-sm font-medium text-foreground">Confirm</label>
                                <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full bg-background border rounded-lg sm:rounded-xl pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-3 outline-none transition-all text-foreground text-sm ${
                                            errors.confirmPassword ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                                        }`}
                                        {...register("confirmPassword", { required: "Required" })}
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                    </button>
                                </div>
                                {errors.confirmPassword?.message && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="pt-1 sm:pt-2">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="acceptedTerms"
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-border text-primary focus:ring-primary/50 bg-background transition-all cursor-pointer"
                                        {...register("acceptedTerms", { required: "Terms must be accepted" })}
                                    />
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    I accept the{" "}
                                    <button 
                                        type="button" 
                                        className="text-primary hover:underline underline-offset-4 font-medium transition-all"
                                        onClick={(e) => { e.preventDefault(); setModalType("terms"); setShowTermsModal(true); }}
                                    >
                                        Terms & Conditions
                                    </button>
                                    {" "}and{" "}
                                    <button 
                                        type="button" 
                                        className="text-primary hover:underline underline-offset-4 font-medium transition-all"
                                        onClick={(e) => { e.preventDefault(); setModalType("privacy"); setShowTermsModal(true); }}
                                    >
                                        Privacy Policy
                                    </button>
                                </div>
                            </div>
                            {errors.acceptedTerms?.message && <p className="text-destructive text-xs mt-1.5 ml-6 sm:ml-7">{errors.acceptedTerms.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-2.5 sm:py-3.5 bg-foreground text-background font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-foreground/90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center mt-4 sm:mt-6"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : "Get Started"}
                        </button>
                    </form>
 
                    <div className="mt-5 sm:mt-8 mb-4 sm:mb-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-surface text-muted-foreground font-medium text-[10px] sm:text-xs uppercase tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-2.5 sm:py-3 px-3 sm:px-4 border border-border bg-background hover:bg-muted text-foreground font-medium text-sm rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 group shadow-sm hover:shadow-md"
                        onClick={() => signIn("google", { callbackUrl: "/auth/oauth-callback" })}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="mt-5 sm:mt-8 text-center text-xs sm:text-sm text-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4 transition-all">
                            Sign In
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
