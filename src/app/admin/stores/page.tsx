"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import '@/src/app/admin/admin.css';
import { FiArrowLeft, FiSearch, FiAlertTriangle, FiX, FiCheck, FiCheckCircle, FiLock, FiTrash2, FiEye, FiShoppingBag, FiInfo } from "react-icons/fi"

export default function AdminStores() {
    const [loading, setLoading] = useState(true)
    const [stores, setStores] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null)
    const [adminPassword, setAdminPassword] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchStores = async () => {
        try {
            const { data } = await axios.get("/api/store/admin/review")
            if (data.success) {
                setStores(data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch stores")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    const handleAction = async (storeId: string, status: string) => {
        try {
            const { data } = await axios.put("/api/store/admin/review", { storeId, status })
            if (data.success) {
                toast.success(`Store ${status} successfully`)
                fetchStores()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Action failed")
        }
    }

    const handleDelete = (storeId: string) => {
        setDeletingStoreId(storeId)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!adminPassword) return toast.error("Please enter your password")

        setIsDeleting(true)
        try {
            const { data } = await axios.delete("/api/store/admin/review", {
                data: { storeId: deletingStoreId, password: adminPassword }
            })
            if (data.success) {
                toast.success("Store deleted successfully")
                setShowDeleteModal(false)
                setAdminPassword("")
                fetchStores()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Authentication failed or delete failed")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    const filteredStores = stores.filter((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-surface px-4 py-2 rounded-lg border border-border w-fit shadow-sm mb-4">
                            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Store Management</h1>
                        <p className="text-muted-foreground">Review, approve, or reject seller store registration requests.</p>
                    </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search stores by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm text-foreground shadow-inner"
                        />
                    </div>
                </div>

                <div>
                    {filteredStores.length === 0 ? (
                        <div className="bg-surface border border-dashed border-border rounded-3xl py-24 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <FiShoppingBag className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">No active stores</h3>
                            <p className="text-muted-foreground max-w-sm">There are no store requests or approved stores matching your search query.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStores.map((store: any) => (
                                <div key={store._id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                                            {store.logo ? (
                                                <Image src={store.logo} alt={store.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-muted-foreground">
                                                    {store.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="text-lg font-bold text-foreground truncate">{store.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                                    store.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                                                    store.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                                    store.status === 'frozen' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-red-500/10 text-red-600'
                                                }`}>
                                                    {store.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-border/60">
                                        {store.status === 'pending' ? (
                                            <>
                                                <Link href={`/admin/stores/${store._id}`} className="col-span-2 flex justify-center items-center gap-2 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground">
                                                    <FiEye className="w-4 h-4" /> View Details
                                                </Link>
                                                <button onClick={() => handleAction(store._id, 'approved')} className="flex justify-center items-center gap-2 py-2.5 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-lg text-sm font-semibold transition-colors">
                                                    <FiCheck className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => handleAction(store._id, 'rejected')} className="flex justify-center items-center gap-2 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-sm font-semibold transition-colors">
                                                    <FiX className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href={`/admin/stores/${store._id}`} className="col-span-2 flex justify-center items-center gap-2 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground">
                                                    <FiEye className="w-4 h-4" /> View Details
                                                </Link>
                                                {store.status === 'approved' && (
                                                    <button onClick={() => handleAction(store._id, 'frozen')} className="flex justify-center items-center gap-2 py-2.5 border border-border bg-background text-blue-600 hover:bg-blue-500/10 rounded-lg text-sm font-semibold transition-colors">
                                                        <FiLock className="w-4 h-4" /> Freeze
                                                    </button>
                                                )}
                                                {store.status === 'frozen' && (
                                                    <button onClick={() => handleAction(store._id, 'approved')} className="flex justify-center items-center gap-2 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-semibold transition-colors">
                                                        <FiCheckCircle className="w-4 h-4" /> Unfreeze
                                                    </button>
                                                )}
                                                {store.status === 'rejected' && (
                                                    <div className="flex justify-center items-center py-2.5 text-muted-foreground text-sm font-medium">
                                                        Rejected
                                                    </div>
                                                )}
                                                <button onClick={() => handleDelete(store._id)} className="flex justify-center items-center gap-2 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-sm font-semibold transition-colors">
                                                    <FiTrash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isDeleting && setShowDeleteModal(false)} />
                    
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-center flex flex-col items-center p-8">
                        <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                            <FiX className="w-5 h-5" />
                        </button>
                        
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiAlertTriangle className="w-8 h-8" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-foreground mb-2">CRITICAL ACTION</h2>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            You are about to <strong className="text-foreground">permanently delete</strong> a store and its inventory data. This action cannot be reversed.
                        </p>
                        
                        <form onSubmit={handleConfirmDelete} className="w-full space-y-6">
                            <div className="relative text-left focus-within:text-destructive transition-colors">
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Enter Admin Password to confirm</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="Admin Password"
                                        autoFocus
                                        required
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 transition-all text-foreground font-medium shadow-inner"
                                    />
                                    <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isDeleting || !adminPassword} className="flex-1 py-3.5 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center text-sm">
                                    {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "CONFIRM DELETION"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
