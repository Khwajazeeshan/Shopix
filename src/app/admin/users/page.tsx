"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { FiX, FiLock, FiAlertTriangle, FiArrowLeft, FiUser, FiShoppingBag, FiTrash2, FiSearch } from "react-icons/fi"
import Link from "next/link"
import Loader from "@/src/components/Loader"
import '@/src/app/admin/admin.css';

export default function AdminUsers() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<any>({ customers: [], sellers: [] })
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
    const [adminPassword, setAdminPassword] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/admin/users")
            if (data.success) {
                setUsers(data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleDeleteClick = (userId: string) => {
        setDeletingUserId(userId)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!adminPassword) return toast.error("Please enter your password")

        setIsDeleting(true)
        try {
            const { data } = await axios.delete("/api/admin/users", {
                data: { userId: deletingUserId, password: adminPassword }
            })
            if (data.success) {
                toast.success("User and data deleted successfully")
                setShowDeleteModal(false)
                setAdminPassword("")
                fetchUsers()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Authentication failed or delete failed")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) return <Loader />

    const filteredCustomers = users.customers.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSellers = users.sellers.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-surface px-4 py-2 rounded-lg border border-border w-fit shadow-sm mb-4">
                            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">User Management</h1>
                        <p className="text-muted-foreground">Manage all registered customers and sellers in the system.</p>
                    </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm text-foreground shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className="bg-blue-500/10 text-blue-600 px-4 py-2 rounded-lg border border-blue-500/20">
                            {filteredCustomers.length} Customers
                        </div>
                        <div className="bg-purple-500/10 text-purple-600 px-4 py-2 rounded-lg border border-purple-500/20">
                            {filteredSellers.length} Sellers
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customers Section */}
                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                <FiUser className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Customers</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] hidden-scrollbar">
                            {filteredCustomers.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-background rounded-2xl border border-dashed border-border">
                                    <p>No customers found matching "{searchQuery}".</p>
                                </div>
                            ) : (
                                filteredCustomers.map((user: any) => (
                                    <div key={user._id} className="bg-background border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-bold text-lg shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h3 className="font-bold text-foreground truncate">{user.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteClick(user._id)}
                                            className="p-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-colors shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete User"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sellers Section */}
                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                                <FiShoppingBag className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Sellers</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] hidden-scrollbar">
                            {filteredSellers.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-background rounded-2xl border border-dashed border-border">
                                    <p>No sellers found matching "{searchQuery}".</p>
                                </div>
                            ) : (
                                filteredSellers.map((user: any) => (
                                    <div key={user._id} className="bg-background border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center font-bold text-lg shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h3 className="font-bold text-foreground truncate">{user.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteClick(user._id)}
                                            className="p-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-colors shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete User"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
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
                        
                        <h2 className="text-2xl font-bold text-foreground mb-2">Delete Account</h2>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            This will <strong className="text-foreground">permanently delete</strong> the user account and all associated data. This action cannot be reversed.
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
                                    {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Confirm Deletion"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
