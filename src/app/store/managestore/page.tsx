"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiEdit3, FiTrash2, FiInfo, FiTag, FiBriefcase, FiMail, FiCheckCircle, FiClock, FiXCircle, FiUploadCloud, FiX, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import Loader from "@/src/components/Loader"

type StoreUpdateInputs = {
    name: string;
    description: string;
    type: string;
    logo: FileList;
}

export default function ManageStore() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<StoreUpdateInputs>();
    const logoFile = watch("logo");
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (logoFile && logoFile.length > 0) {
            const file = logoFile[0];
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, [logoFile]);

    const fetchStore = async () => {
        try {
            const { data } = await axios.get("/api/store/manage")
            if (data.success) {
                setStore(data.store)
                setValue("name", data.store.name)
                setValue("description", data.store.description)
                setValue("type", data.store.type)
                setPreview(data.store.logo)
            }
        } catch (error: any) {
            toast.error("Failed to load store information")
            router.push("/store/dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStore() }, [])

    const onUpdateSubmit = async (data: StoreUpdateInputs) => {
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("type", data.type);
            if (data.logo && data.logo.length > 0) formData.append("logo", data.logo[0]);
            const response = await axios.put("/api/store/manage", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data.success) {
                toast.success("Store updated successfully!");
                setShowUpdateModal(false);
                fetchStore();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update store");
        } finally {
            setIsUpdating(false);
        }
    };

    const onConfirmDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!deletePassword) return toast.error("Please enter your password")
        if (deletePassword.length < 5) return toast.error("Password must be at least 5 characters")
        setIsDeleting(true)
        try {
            const { data } = await axios.delete("/api/store/manage", { data: { password: deletePassword } })
            if (data.success) {
                toast.success("Store deleted successfully")
                router.push("/")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Incorrect password or failed to delete")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader /></div>
    if (!store) return null

    if (store.status === "frozen") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
                <div className="bg-surface border border-red-200 dark:border-red-900/30 rounded-3xl p-8 sm:p-12 text-center max-w-lg shadow-xl shrink-0 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FiXCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4">Store Access Restricted</h1>
                    <p className="text-muted-foreground mb-8 text-lg">This store is currently frozen. Management actions are restricted.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-6 py-3 bg-muted border border-border text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors">
                            Back to Home
                        </Link>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md">
                            Retry Access
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-8 h-20 flex items-center shadow-sm">
                <div className="flex items-center gap-4 w-full max-w-5xl mx-auto pl-2">
                    <Link href="/store/dashboard" className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Manage Store</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Update configurations and details</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                {/* Store Profile Card */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors duration-500" />
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-border pb-8 mb-8">
                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-background shadow-md bg-muted shrink-0">
                            {store.logo ? (
                                <Image src={store.logo} alt={store.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-muted-foreground">{store.name[0]}</div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
                            <div>
                                <h2 className="text-3xl font-extrabold text-foreground mb-2">{store.name}</h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full font-medium text-sm">
                                    <FiCheckCircle className="w-4 h-4" /> Status: {store.status}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-2 sm:mt-0">
                                <button 
                                    onClick={() => setShowUpdateModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all"
                                >
                                    <FiEdit3 className="w-4 h-4" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-foreground">About the Store</h3>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0"><FiInfo className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Description</p>
                                    <p className="text-foreground leading-relaxed text-sm">{store.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0"><FiBriefcase className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Store Type</p>
                                    <p className="text-foreground font-medium">{store.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-foreground">Contact & Identity</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0"><FiMail className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Seller Email</p>
                                    <p className="text-foreground font-medium">{store.sellerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0"><FiTag className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Store ID</p>
                                    <p className="text-muted-foreground font-mono text-xs truncate max-w-[200px]">{store._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 bg-destructive/5 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 px-6 sm:px-10 pb-6 sm:pb-10 rounded-b-3xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-destructive flex items-center gap-2 mb-1"><FiAlertTriangle /> Danger Zone</h3>
                                <p className="text-muted-foreground text-sm">Once you delete your store, there is no going back</p>
                            </div>
                            <button 
                                onClick={() => setShowDeleteModal(true)} 
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                                <FiTrash2 className="w-4 h-4" /> Delete Store
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div onClick={() => !isUpdating && setShowUpdateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Update Store Profile</h2>
                                <p className="text-xs text-muted-foreground mt-1">Modify your storefront details</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} disabled={isUpdating} className="p-2 bg-background border border-border rounded-full hover:bg-muted text-muted-foreground transition-colors"><FiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="p-6 sm:p-8 overflow-y-auto hidden-scrollbar space-y-6">
                            <div className="space-y-2 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Store Banner / Logo</label>
                                <label className="block w-full h-40 border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl transition-colors cursor-pointer overflow-hidden group relative">
                                    {preview ? (
                                        <>
                                            <Image src={preview} alt="Preview" fill className="object-cover opacity-80" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2">
                                                <FiUploadCloud className="w-5 h-5" /> Replace Logo
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-primary transition-colors">
                                            <FiUploadCloud className="w-8 h-8 mb-3" />
                                            <span className="font-medium">Click to upload new logo</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" {...register("logo")} />
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-medium text-foreground">Store Name</label>
                                    <input
                                        placeholder="My Amazing Store"
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                        {...register("name", { required: "Store name is required", minLength: { value: 4, message: "Min 4 characters" } })}
                                    />
                                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-medium text-foreground">Store Type</label>
                                    <select 
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground appearance-none"
                                        {...register("type", { required: "Type is required" })}
                                    >
                                        <option value="Individual">Individual</option>
                                        <option value="Company">Company</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell your customers what you sell..."
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground resize-none"
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
                            </div>
                            
                            <div className="pt-4 border-t border-border flex justify-end gap-3 mt-6">
                                <button type="button" disabled={isUpdating} onClick={() => setShowUpdateModal(false)} className="px-6 py-3 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUpdating} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 flex items-center justify-center transition-all shadow-md active:scale-[0.98] disabled:opacity-70 min-w-[150px]">
                                    {isUpdating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div onClick={() => !isDeleting && setShowDeleteModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-center flex flex-col items-center p-8">
                        <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground"><FiX className="w-5 h-5" /></button>
                        
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiAlertTriangle className="w-8 h-8" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-foreground mb-2">Delete Store</h2>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-[280px]">
                            You are about to <strong className="text-foreground">permanently</strong> delete your store. Please confirm your password.
                        </p>
                        
                        <form onSubmit={onConfirmDelete} className="w-full space-y-6">
                            <div className="relative text-left focus-within:text-destructive transition-colors">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    required
                                    minLength={5}
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-xl pl-12 pr-12 py-3.5 outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 transition-all text-foreground font-medium"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isDeleting || !deletePassword} className="flex-1 py-3.5 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                                    {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Confirm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}