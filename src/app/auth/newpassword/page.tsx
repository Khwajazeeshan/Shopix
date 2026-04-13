"use client";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { KeyRound, ShieldCheck } from "lucide-react";

type NewPasswordInputs = {
    newPassword: string;
    confirmPassword: string;
};

function NewPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAdminReset = searchParams.get("isAdminReset") === "true";
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<NewPasswordInputs>();

    const onSubmit = async (data: NewPasswordInputs) => {
        if (data.newPassword !== data.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (!isAdminReset && !token) {
            return toast.error("Invalid token");
        }

        try {
            const payload = isAdminReset
                ? { isAdminReset: true, newPassword: data.newPassword }
                : { token, newPassword: data.newPassword };

            const response = await axios.post("/api/auth/forgetpassword", payload);
            if (response.data.success) {
                toast.success(response.data.message);
                router.push(isAdminReset ? "/auth/profile" : "/auth/login");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary/5">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6 mx-auto shadow-inner shadow-primary/20">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">New Password</h1>
                <p className="text-muted-foreground">Create a secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-background border rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all text-foreground ${
                                errors.newPassword ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                            }`}
                            {...register("newPassword", {
                                required: "Required",
                                minLength: { value: 6, message: "Min 6 characters" },
                            })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                    {errors.newPassword?.message && <p className="text-destructive text-xs mt-1.5 ml-1">{errors.newPassword.message}</p>}
                </div>

                <div className="space-y-2 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-background border rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all text-foreground ${
                                errors.confirmPassword ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/50"
                            }`}
                            {...register("confirmPassword", {
                                required: "Required",
                            })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword?.message && <p className="text-destructive text-xs mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-6 bg-foreground text-background font-bold text-base rounded-xl hover:bg-foreground/90 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function NewPassword() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Suspense fallback={
                    <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-muted-foreground">Loading...</h2>
                    </div>
                }>
                    <NewPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}

