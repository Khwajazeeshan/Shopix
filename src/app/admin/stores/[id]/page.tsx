"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiPackage, FiInfo, FiTag, FiClock, FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi"
import Loader from "@/src/components/Loader"

export default function ViewStoreAdmin({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const storeId = resolvedParams.id;

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    const fetchStoreDetails = async () => {
        try {
            const response = await axios.get(`/api/admin/stores/${storeId}`)
            if (response.data.success) {
                setData(response.data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch store details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStoreDetails()
    }, [storeId])

    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return

        setDeletingId(productId)
        try {
            const response = await axios.delete(`/api/products/${productId}`)
            if (response.data.success) {
                toast.success("Product deleted successfully")
                fetchStoreDetails() // Refresh data
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete product")
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) return <Loader />

    if (!data) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FiXCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Store Not Found</h1>
            <p className="text-muted-foreground max-w-md mb-8">The requested store does not exist or you do not have permission to view it.</p>
            <Link href="/admin/stores" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-md">
                Back to Stores
            </Link>
        </div>
    )

    const { store, products } = data

    const statusConfig: any = {
        pending: { icon: <FiClock className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        approved: { icon: <FiCheckCircle className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        rejected: { icon: <FiXCircle className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
        frozen: { icon: <FiXCircle className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    }

    const currentStatus = statusConfig[store.status] || statusConfig.pending

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="bg-surface/80 backdrop-blur-xl border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/stores" className="p-2 bg-background border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight line-clamp-1">Reviewing Store</h1>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">Admin Control Panel</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 flex flex-col gap-6">
                        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 shadow-md border-4 border-background">
                                <Image src={store.logo} alt={store.name} fill className="object-cover" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">{store.name}</h1>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border mb-4 ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                                {currentStatus.icon}
                                {store.status}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm text-center">
                                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Store Revenue</span>
                                <p className="text-xl font-bold text-foreground">Rs. {(data.totalSales || 0).toLocaleString()}</p>
                            </div>
                             <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm text-center">
                                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Inventory</span>
                                <p className="text-xl font-bold text-foreground">{products.length} Items</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 flex flex-col gap-6">
                        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                                <FiInfo className="w-5 h-5 text-primary" /> Store Information
                            </h2>
                            <div className="space-y-6 flex-1">
                                <div className="bg-background rounded-2xl p-5 border border-border">
                                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Store Description</span>
                                    <p className="text-foreground leading-relaxed text-sm sm:text-base">{store.description}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="bg-background rounded-2xl p-5 border border-border">
                                        <div className="flex items-center gap-2 mb-2 text-primary">
                                            <FiTag className="w-4 h-4" />
                                            <span className="text-sm font-bold">Business Type</span>
                                        </div>
                                        <p className="text-foreground font-medium capitalize">{store.type}</p>
                                    </div>
                                    <div className="bg-background rounded-2xl p-5 border border-border">
                                        <div className="flex items-center gap-2 mb-2 text-blue-500">
                                            <FiPackage className="w-4 h-4" />
                                            <span className="text-sm font-bold">Seller Profile</span>
                                        </div>
                                        <p className="text-foreground font-medium text-sm mb-1 truncate">
                                            <span className="text-muted-foreground w-12 inline-block">Name:</span> {store.sellerId?.name}
                                        </p>
                                        <p className="text-foreground font-medium text-sm truncate">
                                             <span className="text-muted-foreground w-12 inline-block">Email:</span> {store.sellerId?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Store Inventory</h2>
                            <p className="text-sm text-muted-foreground">Detailed list of all products in this store</p>
                        </div>
                        <div className="text-sm font-semibold bg-background px-4 py-2 rounded-lg border border-border">{products.length} Products</div>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FiPackage className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
                            <p className="text-sm text-muted-foreground">This store currently has no products listed.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product: any) => (
                                <div key={product._id} className="bg-background border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                                    <div className="p-4 flex-1">
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                                                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{product.description}</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
                                                    <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md">QTY: {product.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-border bg-muted/20">
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            disabled={deletingId === product._id}
                                            className="w-full py-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-destructive/50 disabled:opacity-50"
                                        >
                                            {deletingId === product._id ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
                                            ) : (
                                                <><FiTrash2 className="w-4 h-4" /> Delete Product</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
