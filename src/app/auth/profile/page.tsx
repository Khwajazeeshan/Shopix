"use client"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signOut } from "next-auth/react";
import Loader from "@/src/components/Loader"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"
import { User, Shield, ShieldAlert, LogOut, Key, Trash2, Edit3, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react"

export default function Profile() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [showPopup, setShowPopup] = useState(false)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({ name: "", role: "" })
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get("/api/auth/user")
                if (response.data.success) {
                    setUser(response.data.data)
                }
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Session expired. Please login again.")
                router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [router])

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            const { data } = await axios.get("/api/auth/logout")
            if (data.success) {
                toast.success(data.message)
                router.push("/auth/login")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Logout failed")
        }
    }

    const HandleDeleteAccount = async () => {
        if (!password) return toast.error("Please enter your password to confirm");
        try {
            const { data } = await axios.delete("/api/auth/deleteaccount", {
                data: { userId: user._id, password: password }
            })
            if (data.success) {
                toast.success(data.message)
                router.push("/")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Account Deletion failed")
        } finally {
            setShowPopup(false)
            setPassword("")
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const response = await axios.put("/api/auth/user", editForm)
            if (response.data.success) {
                toast.success("Profile updated successfully")
                setUser(response.data.data)
                setIsEditModalOpen(false)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Update failed")
        } finally {
            setUpdating(false)
        }
    }

    const openEditModal = () => {
        setEditForm({ name: user.name, role: user.role })
        setIsEditModalOpen(true)
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <Loader />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-8 lg:mb-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <div className="mb-4">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Homepage
                            </Link>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Manage your professional identity and security.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors duration-500" />
                            
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Profile Details
                                </h2>
                                {user && (
                                    <button 
                                        onClick={openEditModal}
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors tooltip"
                                        title="Edit Profile"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mb-4 border-4 border-background shadow-md">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">{user?.name || "Unknown User"}</h3>
                                <p className="text-muted-foreground mt-1">{user?.email}</p>
                                
                                <div className="flex items-center gap-2 mt-4 bg-muted/50 px-4 py-1.5 rounded-full border border-border">
                                    {user?.isVerified ? (
                                        <><CheckCircle className="w-4 h-4 text-green-500" /> <span className="text-sm font-medium">Verified Account</span></>
                                    ) : (
                                        <><AlertCircle className="w-4 h-4 text-yellow-500" /> <span className="text-sm font-medium">Pending Verification</span></>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Account Role</span>
                                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full capitalize">{user?.role || "Customer"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Member Since</span>
                                    <span className="font-medium text-foreground">{new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings & Security */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Security Section */}
                        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-primary" /> Account Security
                            </h2>
                            <p className="text-muted-foreground mb-8">Ensuring your account security is our top priority. Manage your session and credentials.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        if (user?.role === "admin") {
                                            router.push("/auth/adminpassword?isAdminReset=true");
                                        } else {
                                            router.push("/auth/forgetpassword");
                                        }
                                    }}
                                    className="flex flex-col items-start p-5 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-foreground mb-1">Change Password</span>
                                    <span className="text-xs text-muted-foreground">Keep your account secure with a strong password.</span>
                                </button>

                                <button 
                                    onClick={handleLogout}
                                    className="flex flex-col items-start p-5 rounded-2xl border border-border hover:border-destructive/50 hover:bg-destructive/5 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-foreground mb-1">Log Out Session</span>
                                    <span className="text-xs text-muted-foreground">Sign out of your active session on this device.</span>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        {user?.role !== "admin" && (
                            <div className="bg-surface border border-red-200 dark:border-red-900/30 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
                                
                                <h2 className="text-xl font-bold text-destructive flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                                </h2>
                                <p className="text-muted-foreground mb-6">Permanently remove your personal account and all its contents. Once you delete your account, there is no going back.</p>
                                
                                <button 
                                    onClick={() => setShowPopup(true)}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-xl transition-colors w-full sm:w-auto"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Account Permanently
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <Footer />

            {/* Delete Confirmation Popup */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
                        onClick={() => { setShowPopup(false); setPassword(""); }} 
                    />
                    <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 p-4 shadow-inner">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Confirm Deletion</h2>
                            <p className="text-muted-foreground text-sm mb-6">This action cannot be undone. Please enter your password to confirm account deletion.</p>
                            
                            <div className="space-y-4 text-left">
                                <div className="relative focus-within:text-destructive transition-colors">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/50 transition-all text-foreground"
                                    />
                                    <button 
                                        type="button" 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={() => { setShowPopup(false); setPassword(""); }}
                                className="flex-1 px-4 py-3 bg-background border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={HandleDeleteAccount}
                                disabled={!password}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md shadow-red-600/20"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
                        onClick={() => setIsEditModalOpen(false)} 
                    />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-primary" /> Update Profile
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-5">
                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                />
                            </div>
                            {user?.role !== "admin" && user?.role !== "seller" && (
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-medium text-foreground">Request Role Change</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            required
                                            className="w-full bg-surface border border-border rounded-xl pl-4 pr-10 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-foreground"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="seller">Seller</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-foreground border border-border font-medium rounded-xl hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updating || editForm.name === ""}
                                    className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-md shadow-primary/20 flex justify-center items-center"
                                >
                                    {updating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
