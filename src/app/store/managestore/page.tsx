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
                <div className="flex items-center gap-2 sm:gap-4 w-full max-w-5xl mx-auto pl-1 sm:pl-2">
                    <Link href="/store/dashboard" className="p-1.5 sm:p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1 sm:mr-2">
                        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tight sm:tracking-normal">Store Profile</h1>
                        <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block font-black uppercase tracking-widest">Configuration & Identity</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                {/* Store Profile Card */}
                <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-[60px] sm:blur-[80px] -z-10 translate-x-10 -translate-y-10" />
                    
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-center border-b border-border pb-6 sm:pb-8 mb-6 sm:mb-8 text-center md:text-left">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-background shadow-md bg-muted shrink-0">
                            {store.logo ? (
                                <Image src={store.logo} alt={store.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-3xl text-muted-foreground uppercase">{store.name[0]}</div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col items-center md:items-start justify-between gap-4 w-full">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-1 uppercase tracking-tight">{store.name}</h2>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-500/20">
                                    <FiCheckCircle className="w-3 h-3" /> {store.status}
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowUpdateModal(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-black text-[10px] sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <FiEdit3 /> Edit Identity
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l-2 border-primary pl-2">Executive Summary</h3>
                            <div className="bg-muted/10 p-3 rounded-xl border border-border">
                                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-1">Store Description</p>
                                <p className="text-foreground leading-relaxed text-xs font-black uppercase tracking-tight">{store.description}</p>
                            </div>
                            <div className="bg-muted/10 p-3 rounded-xl border border-border flex justify-between items-center">
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Type</span>
                                <span className="text-foreground font-black text-[10px] uppercase">{store.type}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l-2 border-primary pl-2">Legal Artifacts</h3>
                            <div className="bg-muted/10 p-3 rounded-xl border border-border flex justify-between items-center">
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Mail</span>
                                <span className="text-foreground font-black text-[10px] truncate max-w-[150px]">{store.sellerEmail}</span>
                            </div>
                            <div className="bg-muted/10 p-3 rounded-xl border border-border flex justify-between items-center">
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Hash ID</span>
                                <span className="text-muted-foreground font-black text-[8px] uppercase tracking-tighter truncate max-w-[120px]">{store._id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-6 sm:pt-8 bg-destructive/5 -mx-4 sm:-mx-10 -mb-4 sm:-mb-10 px-4 sm:px-10 pb-4 sm:pb-10 rounded-b-2xl sm:rounded-b-3xl">
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 text-center sm:text-left">
                            <div>
                                <h3 className="text-sm font-black text-destructive flex items-center justify-center sm:justify-start gap-2 mb-0.5 uppercase tracking-widest"><FiAlertTriangle /> Danger Protocol</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Terminal store closure is irreversible</p>
                            </div>
                            <button 
                                onClick={() => setShowDeleteModal(true)} 
                                disabled={isDeleting}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-background border border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                                <FiTrash2 /> Liquidate Store
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
                        <div className="px-4 py-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Identity Update</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Reconfigure storefront</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} disabled={isUpdating} className="p-1.5 bg-background border border-border rounded-full hover:bg-muted text-muted-foreground transition-colors"><FiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="p-4 sm:p-8 overflow-y-auto hidden-scrollbar space-y-5">
                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Store Iconography</label>
                                <label className="block w-full h-32 sm:h-40 border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl transition-colors cursor-pointer overflow-hidden group relative">
                                    {preview ? (
                                        <>
                                            <Image src={preview} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-all" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FiUploadCloud className="w-4 h-4 mb-1" /> Update File
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-primary transition-colors">
                                            <FiUploadCloud className="w-6 h-6 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Initiate Upload</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" {...register("logo")} />
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Nominal Identity</label>
                                    <input
                                        placeholder="Enter Store Name"
                                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs sm:text-sm text-foreground font-black uppercase tracking-tight"
                                        {...register("name", { required: "Required", minLength: { value: 4, message: "Min 4 chars" } })}
                                    />
                                    {errors.name && <p className="text-destructive text-[8px] font-black uppercase tracking-widest mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Legal Entity</label>
                                    <select 
                                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs sm:text-sm text-foreground font-black uppercase appearance-none"
                                        {...register("type", { required: "Type is required" })}
                                    >
                                        <option value="Individual">Individual</option>
                                        <option value="Company">Company</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Narrative</label>
                                <textarea
                                    rows={3}
                                    placeholder="Inventory specialization data..."
                                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs sm:text-sm text-foreground font-black uppercase tracking-tight resize-none"
                                    {...register("description", { required: "Required" })}
                                />
                                {errors.description && <p className="text-destructive text-[8px] font-black uppercase tracking-widest mt-1">{errors.description.message}</p>}
                            </div>
                            
                            <div className="pt-4 border-t border-border flex flex-col gap-2">
                                <button type="submit" disabled={isUpdating} className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 flex items-center justify-center transition-all shadow-md active:scale-[0.98] disabled:opacity-70">
                                    {isUpdating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Save Intelligence"}
                                </button>
                                <button type="button" disabled={isUpdating} onClick={() => setShowUpdateModal(false)} className="w-full py-3 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                                    Cancel
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
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-center flex flex-col items-center p-6 sm:p-10">
                        <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"><FiX className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                        
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiAlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-black text-foreground mb-1 uppercase tracking-tight">Danger Protocol</h2>
                        <p className="text-[10px] sm:text-sm text-muted-foreground mb-8 leading-relaxed font-black uppercase tracking-widest opacity-60 max-w-[240px]">
                            Authorize <strong className="text-destructive">Terminal Closure</strong> of your storefront identity.
                        </p>
                        
                        <form onSubmit={onConfirmDelete} className="w-full space-y-4">
                            <div className="relative text-left focus-within:text-destructive transition-colors">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    required
                                    minLength={5}
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 sm:py-3.5 outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 transition-all text-[10px] sm:text-sm text-foreground font-black uppercase tracking-widest placeholder:opacity-50"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-2">
                                <button type="submit" disabled={isDeleting || !deletePassword} className="w-full py-3.5 bg-destructive text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-destructive/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                                    {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Authorize Liquidation"}
                                </button>
                                <button type="button" disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="w-full py-2.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                                    Abort Protocol
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}