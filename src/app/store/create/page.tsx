"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiArrowLeft, FiUploadCloud, FiClock, FiAlertCircle } from "react-icons/fi"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

export default function CreateStore() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [storeStatus, setStoreStatus] = useState<any>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "Individual",
        logo: null as File | null
    })

    useEffect(() => {
        if (formData.logo) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(formData.logo);
        } else {
            setPreview(null);
        }
    }, [formData.logo]);

    useEffect(() => {
        const checkStore = async () => {
            try {
                const { data } = await axios.get("/api/store")
                if (data.success) {
                    setStoreStatus(data.store)
                    if (data.store.status === "approved" || data.store.status === "frozen") {
                        router.push("/store/dashboard")
                    }
                }
            } catch (error: any) {
                if (error.response?.status !== 404) {
                    toast.error("Failed to check store status")
                }
            } finally {
                setLoading(false)
            }
        }
        checkStore()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) return toast.error("Store name is required")
        if (formData.name.length < 4) return toast.error("Store name must be at least 4 characters")
        if (!formData.description) return toast.error("Store description is required")
        const wordCount = formData.description.trim().split(/\s+/).length
        if (wordCount > 100) return toast.error("Description must be maximum 100 words")
        if (!formData.logo) return toast.error("Please upload a store logo")

        setSubmitting(true)
        try {
            const data = new FormData()
            data.append("name", formData.name)
            data.append("description", formData.description)
            data.append("type", formData.type)
            data.append("logo", formData.logo)
            const response = await axios.post("/api/store", data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            if (response.data.success) {
                toast.success("Store submitted for approval!")
                setStoreStatus(response.data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Submission failed")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
        )
    }

    if (storeStatus?.status === "pending") {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                
                <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 py-10">
                    <div className="bg-surface border border-orange-200 dark:border-orange-900/30 rounded-3xl p-8 sm:p-12 text-center shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
                        <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FiClock className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-4">Approval Pending</h1>
                        <p className="text-muted-foreground mb-8 text-lg">Your store creation request has been submitted successfully and is currently under review by our administration. We will notify you once it's approved.</p>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-lg active:scale-[0.98]">
                            <FiArrowLeft className="w-5 h-5" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (storeStatus?.status === "approved") return null

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 py-10">
                <Link 
                    href="/" 
                    className="absolute top-0 left-0 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:-translate-x-1 duration-200"
                >
                    <FiArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary/5 mt-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors duration-500" />
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center justify-center w-14 h-14 bg-primary text-white rounded-2xl mb-6 shadow-lg shadow-primary/20">
                            <ShoppingBag className="w-7 h-7" />
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create Your Store</h1>
                        <p className="text-muted-foreground">Start your seller journey with Shopix Marketplace.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <div className="space-y-2 focus-within:text-primary transition-colors">
                            <label className="text-sm font-medium text-foreground">Store Logo & Branding</label>
                            <label className="block w-full h-40 border-2 border-dashed border-border hover:border-primary/50 bg-background rounded-2xl transition-colors cursor-pointer overflow-hidden group relative">
                                {preview ? (
                                    <>
                                        <Image src={preview} alt="Store Logo Preview" fill className="object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2">
                                            <FiUploadCloud className="w-5 h-5" /> Replace Logo
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-[&:hover]:text-primary transition-colors">
                                        <FiUploadCloud className="w-10 h-10 mb-3" />
                                        <span className="font-medium">Click to upload store logo</span>
                                        <span className="text-xs mt-1">Recommended: Square image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.files ? e.target.files[0] : null })}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Store Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Vintage Apparel"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Min 4 characters</p>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Store Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-foreground"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Individual">Individual</option>
                                        <option value="Company">Company</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-sm font-medium text-foreground">Store Description</label>
                            <textarea
                                placeholder="Tell us about what you sell..."
                                rows={4}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Max 100 words</p>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mt-8">
                            <FiAlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-primary/80 leading-relaxed font-medium">
                                Note: Your store will be marked as <strong className="text-primary">Pending</strong> once submitted. Our administration team will review and approve your store before you can start selling.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full mt-6 py-4 bg-foreground text-background font-bold text-lg rounded-xl hover:bg-foreground/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                        >
                            {submitting ? (
                                <div className="w-6 h-6 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                            ) : "Submit Setup Request"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
