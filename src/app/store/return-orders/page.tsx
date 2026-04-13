"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiXCircle, FiCheckCircle, FiRefreshCcw, FiUser, FiCalendar, FiPackage, FiMessageSquare, FiImage, FiAlertCircle } from "react-icons/fi"
import { toast } from "react-hot-toast"
import Loader from "@/src/components/Loader"

export default function ReturnRequestsView() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const [returnOrders, setReturnOrders] = useState<any[]>([])
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchStoreAndReturns = async () => {
        try {
            const { data: storeData } = await axios.get("/api/store")
            if (storeData.success) {
                setStore(storeData.store)
                const { data: returnData } = await axios.get(`/api/orders/return?storeId=${storeData.store._id}`)
                if (returnData.success) {
                    setReturnOrders(returnData.orders)
                }
            } else {
                router.push("/store/create")
            }
        } catch (error: any) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStoreAndReturns()
    }, [router])

    const handleReturnAction = async (orderId: string, decision: "successful" | "failed") => {
        setIsUpdating(true)
        try {
            const { data } = await axios.patch("/api/orders/return", { orderId, decision })
            if (data.success) {
                toast.success(`Return request ${decision === 'successful' ? 'accepted' : 'declined'}`)
                fetchStoreAndReturns()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update return status")
        } finally {
            setIsUpdating(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader /></div>
    if (!store) return null

    const pendingReturnsCount = returnOrders.filter(o => o.returnStatus === 'processing').length

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 pl-2">
                    <Link href="/store/track-orders" className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted shrink-0 hidden sm:block">
                        <Image src={store.logo} alt={store.name} fill className="object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground">{store.name}</h1>
                        <p className="text-xs text-muted-foreground">Return Management</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Return Requests</h1>
                        <p className="text-muted-foreground text-sm">Review and Process Refund Claims</p>
                    </div>
                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl shadow-sm">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Protocol</span>
                        <div className="flex items-center justify-center min-w-[28px] h-7 px-2 bg-orange-500/10 text-orange-600 rounded-lg font-bold text-sm border border-orange-500/20">
                            {pendingReturnsCount}
                        </div>
                    </div>
                </div>

                {returnOrders.length === 0 ? (
                    <div className="bg-surface border border-dashed border-border rounded-3xl py-24 flex flex-col items-center justify-center text-center px-4 mt-8">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiRefreshCcw className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">No Return Records</h3>
                        <p className="text-muted-foreground max-w-sm">Your customers haven't filed any return requests yet. That's a good sign!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {returnOrders.map((order) => (
                            <div key={order._id} className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 relative overflow-hidden group">
                                {order.returnStatus === 'processing' && <div className="absolute top-0 right-0 w-2 h-full bg-orange-500/80" />}
                                {order.returnStatus === 'successful' && <div className="absolute top-0 right-0 w-2 h-full bg-green-500/80" />}
                                {order.returnStatus === 'failed' && <div className="absolute top-0 right-0 w-2 h-full bg-destructive/80" />}
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
                                            <Image src={order.productId?.image} alt="Product" fill className="object-cover" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Product Claim</span>
                                            <h3 className="text-lg font-bold text-foreground leading-tight truncate" title={order.productId?.name}>{order.productId?.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5"><FiUser className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Customer</p>
                                                <p className="text-sm font-medium text-foreground">{order.userId?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"><FiMessageSquare className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Contact</p>
                                                <p className="text-sm font-medium text-foreground">{order.userId?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 sm:col-span-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5"><FiPackage className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Shipping Origin</p>
                                                <p className="text-sm font-medium text-foreground">{order.billingAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-[1.5] flex border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
                                    <div className="flex flex-col h-full w-full">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 pb-6 border-b border-border">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order Date</p>
                                                <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                                                    <FiCalendar className="text-muted-foreground" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Delivered Date</p>
                                                <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                                                    <FiCheckCircle className="text-green-500" />
                                                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><FiAlertCircle /> Reason for Return Claim</p>
                                            <div className="bg-orange-500/5 text-orange-700 dark:text-orange-300 border border-orange-500/20 p-4 rounded-xl text-sm italic shadow-inner">
                                                "{order.returnReason}"
                                            </div>
                                        </div>
                                        
                                        {order.returnPhotos?.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <FiImage /> Visual Evidence
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    {order.returnPhotos.map((photo: string, idx: number) => (
                                                        <a href={photo} target="_blank" rel="noopener noreferrer" key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border hover:border-primary transition-colors block shrink-0 cursor-zoom-in group/img">
                                                            <Image src={photo} alt="Evidence" fill className="object-cover transition-transform group-hover/img:scale-110" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mt-auto pt-6 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Refund Amount</p>
                                                <div className="flex items-end gap-3">
                                                    <h2 className="text-2xl font-black text-foreground">Rs. {order.totalAmount.toLocaleString()}</h2>
                                                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md mb-1 border border-border/50">{order.quantity} unit{order.quantity > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full sm:w-auto flex shrink-0">
                                                {order.returnStatus === 'processing' ? (
                                                    <div className="flex gap-3 w-full sm:w-auto">
                                                        <button 
                                                            disabled={isUpdating}
                                                            onClick={() => handleReturnAction(order._id, "failed")}
                                                            className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:bg-red-500 hover:text-white hover:border-red-500 text-foreground font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
                                                        >
                                                            Decline
                                                        </button>
                                                        <button 
                                                            disabled={isUpdating}
                                                            onClick={() => handleReturnAction(order._id, "successful")}
                                                            className="flex-1 sm:flex-none px-5 py-2.5 bg-green-500 border border-green-500 text-white font-semibold text-sm rounded-xl hover:bg-green-600 hover:border-green-600 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 min-w-[150px]"
                                                        >
                                                            {isUpdating ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><FiCheckCircle /> Accept & Refund</>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm border w-full sm:w-auto ${
                                                        order.returnStatus === 'successful' 
                                                            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                                            : 'bg-destructive/10 text-destructive border-destructive/20'
                                                    }`}>
                                                        {order.returnStatus === 'successful' ? <><FiCheckCircle /> Refund Successful</> : <><FiXCircle /> Claim Declined</>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
