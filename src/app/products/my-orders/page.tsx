"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiCreditCard, FiStar, FiX, FiRefreshCcw, FiUpload, FiAlertCircle, FiRepeat, FiChevronDown, FiChevronUp } from "react-icons/fi"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/navbar/page"
import { toast } from "react-hot-toast"
import Loader from "@/src/components/Loader"

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case "new":
            return <FiClock className="w-5 h-5 text-blue-500" />
        case "progress":
            return <FiTruck className="w-5 h-5 text-orange-500" />
        case "completed":
            return <FiCheckCircle className="w-5 h-5 text-green-500" />
        default:
            return <FiPackage className="w-5 h-5 text-gray-500" />
    }
}

const StatusText = ({ status }: { status: string }) => {
    switch (status) {
        case "new":
            return "Order Received (Pending Approval)"
        case "progress":
            return "In Transit (On the Way)"
        case "completed":
            return "Order Delivered"
        default:
            return "Processing"
    }
}

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [showReturnModal, setShowReturnModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [returnReason, setReturnReason] = useState("")
    const [returnImages, setReturnImages] = useState<FileList | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [filterTab, setFilterTab] = useState("all")
    const [expandedOrders, setExpandedOrders] = useState<string[]>([])
    const router = useRouter()

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get("/api/orders/user")
            if (data.success) {
                setOrders(data.orders)
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFeedbackSubmit = async () => {
        if (!comment.trim()) {
            toast.error("Please add a comment.")
            return
        }
        setSubmitting(true)
        try {
            const response = await axios.post("/api/reviews", {
                productId: selectedOrder.productId._id,
                rating,
                comment
            })
            if (response.data.success) {
                toast.success("Feedback submitted! Thank you.")
                setShowFeedbackModal(false)
                setComment("")
                setRating(5)
                fetchOrders()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit feedback")
        } finally {
            setSubmitting(false)
        }
    }

    const handleReturnSubmit = async () => {
        if (!returnReason.trim()) {
            toast.error("Reason for return is mandatory.")
            return
        }
        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("orderId", selectedOrder._id)
            formData.append("reason", returnReason)
            if (returnImages) {
                Array.from(returnImages).forEach((file) => {
                    formData.append("photos", file)
                })
            }

            const response = await axios.post("/api/orders/return", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            if (response.data.success) {
                toast.success("Return request submitted successfully!")
                setShowReturnModal(false)
                setReturnReason("")
                setReturnImages(null)
                fetchOrders()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit return request")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        )
    }

    const filteredOrders = orders.filter(o => {
        if (filterTab === "all") return true;
        if (filterTab === "active") return ['new', 'progress'].includes(o.status);
        if (filterTab === "completed") return o.status === 'completed';
        if (filterTab === "returns") return o.returnStatus && o.returnStatus !== 'none';
        return true;
    });

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10 border-b border-border pb-6 sm:pb-8">
                    <div className="flex gap-3 sm:gap-4 items-start">
                        <Link href="/" className="mt-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground mb-1 uppercase tracking-widest">My Ledger</h1>
                            <p className="text-xs sm:text-base text-muted-foreground">Order History & Transaction Records</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                {orders.length > 0 && (
                    <div className="flex overflow-x-auto hidden-scrollbar gap-1.5 mb-6 p-1 bg-surface border border-border rounded-xl w-full sm:w-fit drop-shadow-sm">
                        {['all', 'active', 'completed', 'returns'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    filterTab === tab ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center my-10 drop-shadow-sm">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                            <FiPackage className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">No Purchase Records Found</h3>
                        <p className="text-muted-foreground max-w-md mb-8">Head back to the marketplace to start your collection and make your first purchase.</p>
                        <Link href="/" className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-surface border border-dashed border-border rounded-3xl py-20 text-center flex flex-col items-center">
                        <h3 className="text-xl font-bold text-foreground mb-4">No {filterTab} orders found</h3>
                        <button onClick={() => setFilterTab('all')} className="text-primary font-medium hover:underline">View all orders</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-6 lg:p-8">
                                    <div className="flex gap-4 sm:gap-8 items-start">
                                        {/* Product Image - Smaller on Mobile */}
                                        <div className="relative w-20 h-20 sm:w-48 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                            <Image 
                                                src={order.productId?.image || "/placeholder.png"} 
                                                alt={order.productId?.name || "Product"} 
                                                fill 
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Order Essentials */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                                <span>{order.storeId?.name}</span>
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black text-foreground mb-0.5 sm:mb-1 truncate uppercase tracking-tight">{order.productId?.name}</h3>
                                            <div className="text-base sm:text-xl font-black text-foreground">
                                                <span className="text-[10px] sm:text-sm text-primary font-bold mr-0.5 uppercase">Price:</span>
                                                Rs. {order.totalAmount.toLocaleString()}
                                            </div>
                                            
                                            {/* Mobile Detail Toggle */}
                                            <button 
                                                onClick={() => toggleOrderExpansion(order._id)}
                                                className="flex md:hidden items-center gap-1.5 mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
                                            >
                                                {expandedOrders.includes(order._id) ? (
                                                    <><FiChevronUp className="w-3 h-3" /> Hide Details</>
                                                ) : (
                                                    <><FiChevronDown className="w-3 h-3" /> Show Details</>
                                                )}
                                            </button>
                                        </div>

                                        {/* Reference - Hidden on extreme small to save space if needed, or keeping it for sm+ */}
                                        <div className="hidden lg:block text-right bg-background p-3 rounded-xl border border-border h-fit min-w-[140px] shadow-inner">
                                            <p className="text-[10px] text-muted-foreground font-black mb-0.5 uppercase tracking-widest">Reference</p>
                                            <p className="font-mono font-black text-foreground text-xs sm:text-sm mb-0.5">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Collapsible Content - Expanded by default on Desktop (md+) */}
                                    <div className={`${expandedOrders.includes(order._id) ? 'block' : 'hidden'} md:block mt-6 pt-6 border-t border-border space-y-6`}>
                                        <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                                            <div className="flex-1 lg:hidden">
                                                {/* Re-adding Reference for mobile inside expanded view */}
                                                <div className="bg-muted/30 p-3 rounded-xl border border-border inline-block min-w-full sm:min-w-0">
                                                    <p className="text-[10px] text-muted-foreground font-black mb-0.5 uppercase tracking-widest">Order Reference</p>
                                                    <p className="font-mono font-black text-foreground text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full">
                                                <div className="bg-background rounded-lg p-2 sm:p-3 border border-border">
                                                    <span className="block text-[8px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Qty</span>
                                                    <p className="font-black text-foreground text-xs sm:text-sm">{order.quantity} units</p>
                                                </div>
                                                <div className="bg-background rounded-lg p-2 sm:p-3 border border-border">
                                                    <span className="block text-[8px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Total</span>
                                                    <p className="font-black text-primary text-xs sm:text-sm">Rs. {order.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-background rounded-lg p-2 sm:p-3 border border-border">
                                                    <span className="block text-[8px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Method</span>
                                                    <div className="flex items-center gap-1 font-black text-foreground text-[10px] sm:text-sm">
                                                        <FiCreditCard className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                                                        <p className="uppercase">{order.paymentMethod}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-background rounded-lg p-2 sm:p-3 border border-border">
                                                    <span className="block text-[8px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Status</span>
                                                    <div className="flex items-center gap-1 font-black capitalize text-foreground text-[10px] sm:text-sm">
                                                        <StatusIcon status={order.status} />
                                                        <p>{order.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address & Status Bar */}
                                        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 justify-between lg:items-center">
                                            <div className="flex items-center gap-2 sm:gap-3 max-w-sm">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                                                    <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block text-[8px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Shipping Destination</span>
                                                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{order.billingAddress}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                                                <div className="flex items-center gap-2 bg-background px-3 sm:px-4 py-2 rounded-full border border-border shadow-sm w-full sm:w-auto">
                                                    <StatusIcon status={order.status} />
                                                    <span className="text-[10px] sm:text-sm font-black text-foreground uppercase tracking-tighter">
                                                        <StatusText status={order.status} />
                                                    </span>
                                                </div>

                                                {order.returnStatus !== 'none' && (
                                                    <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border shadow-sm w-full sm:w-auto ${
                                                        order.returnStatus === 'processing' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                                        order.returnStatus === 'successful' ? 'bg-green-500/10 border-green-500/20 text-green-600' :
                                                        'bg-red-500/10 border-red-500/20 text-red-600'
                                                    }`}>
                                                        {order.returnStatus === 'processing' ? <FiRefreshCcw className="w-3 h-3 animate-spin" /> : <FiAlertCircle className="w-3 h-3" />}
                                                        <span className="text-[10px] sm:text-sm font-black uppercase">
                                                            {order.returnStatus} Return
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {order.status === 'completed' && (
                                                <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full lg:w-auto">
                                                    <button 
                                                        onClick={() => router.push(`/products/productinfo?id=${order.productId._id}`)}
                                                        className="px-3 py-2 bg-background border border-border text-foreground font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-muted transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiRepeat className="w-3.5 h-3.5" /> Repeat
                                                    </button>
                                                    {order.returnStatus === 'none' && (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setShowReturnModal(true)
                                                            }}
                                                            className="px-3 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-100 transition-all"
                                                        >
                                                            Return
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowFeedbackModal(true)
                                                        }}
                                                        className="px-4 py-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiStar className="w-3.5 h-3.5" /> Feedback
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Feedback Modal */}
            {showFeedbackModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowFeedbackModal(false)}></div>
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4 sm:mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-foreground mb-0.5 uppercase tracking-tighter sm:tracking-normal">Product Feedback</h2>
                                    <p className="text-[10px] sm:text-sm text-muted-foreground font-black truncate max-w-[200px] sm:max-w-[280px] uppercase tracking-widest">{selectedOrder.productId.name}</p>
                                </div>
                                <button onClick={() => setShowFeedbackModal(false)} className="p-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
                                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center p-4 sm:p-6 bg-surface border border-border rounded-2xl">
                                    <p className="text-[10px] sm:text-sm font-black text-foreground mb-3 sm:mb-4 uppercase tracking-widest">Rate Experience</p>
                                    <div className="flex justify-center gap-2 sm:gap-3 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button 
                                                key={s} 
                                                onClick={() => setRating(s)}
                                                className="focus:outline-none transform hover:scale-110 transition-transform p-0.5 sm:p-1"
                                            >
                                                <FiStar className={`w-8 h-8 sm:w-10 sm:h-10 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] sm:text-sm font-black text-muted-foreground mt-3 bg-background inline-block px-4 py-1.5 rounded-full border border-border uppercase tracking-widest">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Great"}
                                        {rating === 5 && "Excellent"}
                                    </p>
                                </div>

                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-[10px] sm:text-sm font-black text-foreground uppercase tracking-widest">Commentary</label>
                                    <textarea 
                                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs sm:text-sm resize-none"
                                        rows={3}
                                        placeholder="Share product quality, packaging..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <button 
                                    onClick={handleFeedbackSubmit}
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                                >
                                    {submitting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Publish Feedback"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowReturnModal(false)}></div>
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-4 sm:p-6 border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-foreground mb-0.5 uppercase tracking-tighter sm:tracking-normal">Return Order</h2>
                                    <p className="text-[10px] sm:text-sm text-muted-foreground font-black uppercase tracking-widest leading-none">ID: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <button onClick={() => setShowReturnModal(false)} className="p-1.5 bg-background border border-border hover:bg-muted rounded-full text-muted-foreground transition-colors">
                                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto hidden-scrollbar space-y-4 sm:space-y-6">
                            <div className="bg-surface p-3 sm:p-4 rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-3 gap-2 sm:divide-x divide-border">
                                <div className="flex flex-col">
                                    <span className="text-[8px] sm:text-xs text-muted-foreground uppercase font-black mb-0.5">Product</span>
                                    <span className="font-bold text-foreground text-[10px] sm:text-sm truncate">{selectedOrder.productId.name}</span>
                                </div>
                                <div className="sm:px-4 flex flex-col">
                                    <span className="text-[8px] sm:text-xs text-muted-foreground uppercase font-black mb-0.5">Quantity</span>
                                    <span className="font-bold text-foreground text-[10px] sm:text-sm">{selectedOrder.quantity} Units</span>
                                </div>
                                <div className="sm:pl-4 flex flex-col">
                                    <span className="text-[8px] sm:text-xs text-muted-foreground uppercase font-black mb-0.5">Refund Value</span>
                                    <span className="font-black text-primary text-[10px] sm:text-sm">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-red-500 transition-colors">
                                <label className="text-[10px] sm:text-sm font-black text-foreground flex gap-1 items-center uppercase tracking-widest">
                                    Reason <span className="text-red-500 text-[8px]">(Mandatory)</span>
                                </label>
                                <textarea 
                                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all text-xs sm:text-sm resize-none"
                                    rows={3}
                                    placeholder="Explain the issue clearly..."
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-[10px] sm:text-sm font-black text-foreground uppercase tracking-widest">Evidence Photos <span className="text-muted-foreground font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={(e) => setReturnImages(e.target.files)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center text-center transition-colors bg-background ${returnImages ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${returnImages ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                            <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <p className="font-black text-foreground text-[10px] sm:text-sm uppercase tracking-widest">
                                            {returnImages ? `${returnImages.length} Selected` : "Upload Evidence"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleReturnSubmit}
                                disabled={submitting}
                                className="w-full py-4 bg-foreground text-background font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-2"
                            >
                                {submitting ? <div className="w-5 h-5 rounded-full border-2 border-background/30 border-t-background animate-spin" /> : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
