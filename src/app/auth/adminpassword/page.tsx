"use client";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { KeyRound, ShieldAlert } from "lucide-react";

type NewPasswordInputs = {
    newPassword: string;
    confirmPassword: string;
};

function AdminPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAdminReset = searchParams.get("isAdminReset") !== "false";
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
        <div className="bg-surface/80 backdrop-blur-xl border border-destructive/20 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-destructive/5 relative overflow-hidden">
            {/* Warning Background Details */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-destructive/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 text-destructive rounded-full mb-6 mx-auto shadow-inner shadow-destructive/20 border border-destructive/20">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Security</h1>
                <p className="text-muted-foreground">Force reset your administrator password.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                <div className="space-y-2 focus-within:text-destructive transition-colors">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-background border rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all text-foreground ${
                                errors.newPassword ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-destructive focus:ring-1 focus:ring-destructive/50"
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

                <div className="space-y-2 focus-within:text-destructive transition-colors">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-background border rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all text-foreground ${
                                errors.confirmPassword ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border focus:border-destructive focus:ring-1 focus:ring-destructive/50"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-destructive text-destructive-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:bg-destructive/90 transition-all hover:shadow-lg hover:shadow-destructive/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                            "Set Password"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/auth/profile")}
                        className="w-full py-4 bg-muted/50 text-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-muted border border-border transition-all active:scale-[0.98] flex justify-center items-center"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AdminPassword() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-destructive/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Suspense fallback={
                    <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full border-4 border-destructive/30 border-t-destructive animate-spin mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-muted-foreground">Loading admin component...</h2>
                    </div>
                }>
                    <AdminPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}

