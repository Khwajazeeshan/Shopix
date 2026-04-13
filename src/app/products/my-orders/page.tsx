"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiCreditCard, FiStar, FiX, FiRefreshCcw, FiUpload, FiAlertCircle, FiRepeat } from "react-icons/fi"
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border pb-8">
                    <div className="flex gap-4 items-start">
                        <Link href="/" className="mt-1 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:block">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Track My Orders</h1>
                            <p className="text-muted-foreground">Your Personal Order Ledger & History</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                {orders.length > 0 && (
                    <div className="flex overflow-x-auto hidden-scrollbar gap-2 mb-8 p-1 bg-surface border border-border rounded-xl w-fit drop-shadow-sm">
                        {['all', 'active', 'completed', 'returns'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                                    filterTab === tab ? "bg-background shadow-sm border border-border text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                {tab} Orders
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
                                <div className="p-5 sm:p-6 lg:p-8">
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                        {/* Product Image */}
                                        <div className="relative w-full md:w-48 aspect-square md:aspect-auto md:h-48 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                            <Image 
                                                src={order.productId?.image || "/placeholder.png"} 
                                                alt={order.productId?.name || "Product"} 
                                                fill 
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Order Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                                                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-muted">
                                                            {order.storeId?.logo && <Image src={order.storeId?.logo} alt="Store" fill className="object-cover" />}
                                                        </div>
                                                        <span>{order.storeId?.name}</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">{order.productId?.name}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-lg mb-2">
                                                        {order.productId?.description}
                                                    </p>
                                                </div>
                                                <div className="md:text-right bg-background p-3 rounded-xl border border-border h-fit md:min-w-[140px]">
                                                    <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Order Reference</p>
                                                    <p className="font-mono font-bold text-foreground text-sm mb-1">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                        Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                                                <div className="bg-background rounded-lg p-3 border border-border">
                                                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Qty</span>
                                                    <p className="font-bold text-foreground">{order.quantity} Units</p>
                                                </div>
                                                <div className="bg-background rounded-lg p-3 border border-border">
                                                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total</span>
                                                    <p className="font-bold text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-background rounded-lg p-3 border border-border">
                                                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payment</span>
                                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                                        <FiCreditCard className="w-4 h-4 text-muted-foreground" />
                                                        <p className="uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-background rounded-lg p-3 border border-border">
                                                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</span>
                                                    <div className="flex items-center gap-1.5 font-bold capitalize text-foreground">
                                                        <StatusIcon status={order.status} />
                                                        <p>{order.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address & Status Bar */}
                                    <div className="mt-6 pt-6 border-t border-border flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                                        <div className="flex items-center gap-3 max-w-sm">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                                                <FiPackage className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Shipping Address</span>
                                                <p className="text-sm font-medium text-foreground truncate">{order.billingAddress}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-2 bg-background px-4 py-2.5 rounded-full border border-border shadow-sm">
                                                <StatusIcon status={order.status} />
                                                <span className="text-sm font-semibold text-foreground">
                                                    <StatusText status={order.status} />
                                                </span>
                                            </div>

                                            {order.returnStatus !== 'none' && (
                                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-sm ${
                                                    order.returnStatus === 'processing' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                                    order.returnStatus === 'successful' ? 'bg-green-500/10 border-green-500/20 text-green-600' :
                                                    'bg-red-500/10 border-red-500/20 text-red-600'
                                                }`}>
                                                    {order.returnStatus === 'processing' ? <FiRefreshCcw className="w-4 h-4 animate-spin" /> : <FiAlertCircle className="w-4 h-4" />}
                                                    <span className="text-sm font-bold">
                                                        {order.returnStatus === 'processing' ? 'Return Processing' : 
                                                         order.returnStatus === 'successful' ? 'Return Successful' : 
                                                         'Return Failed/Declined'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {order.status === 'completed' && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button 
                                                    onClick={() => router.push(`/products/productinfo?id=${order.productId._id}`)}
                                                    className="px-4 py-2.5 bg-background border border-border text-foreground font-semibold text-sm rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
                                                >
                                                    <FiRepeat className="w-4 h-4" /> Buy It Again
                                                </button>
                                                {order.returnStatus === 'none' && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowReturnModal(true)
                                                        }}
                                                        className="px-4 py-2.5 bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 font-semibold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                    >
                                                        Request Return
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setShowFeedbackModal(true)
                                                    }}
                                                    className="px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
                                                >
                                                    <FiStar className="w-4 h-4 fill-current" /> Give Feedback
                                                </button>
                                            </div>
                                        )}
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
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">Product Feedback</h2>
                                    <p className="text-sm text-muted-foreground font-medium truncate max-w-[280px]">{selectedOrder.productId.name}</p>
                                </div>
                                <button onClick={() => setShowFeedbackModal(false)} className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center p-6 bg-surface border border-border rounded-2xl">
                                    <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Rate your experience</p>
                                    <div className="flex justify-center gap-3 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button 
                                                key={s} 
                                                onClick={() => setRating(s)}
                                                className="focus:outline-none transform hover:scale-110 transition-transform p-1"
                                            >
                                                <FiStar className={`w-10 h-10 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground mt-3 bg-background inline-block px-4 py-1.5 rounded-full border border-border">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Great"}
                                        {rating === 5 && "Excellent"}
                                    </p>
                                </div>

                                <div className="space-y-2 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-semibold text-foreground">Tell us more about the product</label>
                                    <textarea 
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none"
                                        rows={4}
                                        placeholder="Share your thoughts on quality, packaging, and performance..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <button 
                                    onClick={handleFeedbackSubmit}
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                                >
                                    {submitting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Confirm & Post Feedback"}
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
                        <div className="p-6 border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">Request Return</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Order: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <button onClick={() => setShowReturnModal(false)} className="p-2 bg-background border border-border hover:bg-muted rounded-full text-muted-foreground transition-colors">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto hidden-scrollbar space-y-6">
                            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                                <div className="flex-1 pb-3 md:pb-0 md:pr-4 flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">Product</span>
                                    <span className="font-medium text-foreground text-sm line-clamp-1">{selectedOrder.productId.name}</span>
                                </div>
                                <div className="px-0 py-3 md:py-0 md:px-4 flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">Quantity</span>
                                    <span className="font-bold text-foreground">{selectedOrder.quantity} Units</span>
                                </div>
                                <div className="flex-1 pt-3 md:pt-0 md:pl-4 flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">Price</span>
                                    <span className="font-bold text-primary">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-2 focus-within:text-red-500 transition-colors">
                                <label className="text-sm font-semibold text-foreground flex gap-1 items-center">
                                    Reason for Return <span className="text-red-500 text-xs">(Mandatory)</span>
                                </label>
                                <textarea 
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all text-sm resize-none"
                                    rows={3}
                                    placeholder="Explain exactly why you want to return this product..."
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 focus-within:text-primary transition-colors">
                                <label className="text-sm font-semibold text-foreground">Evidence Photos <span className="text-muted-foreground font-normal">(Optional but recommended)</span></label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={(e) => setReturnImages(e.target.files)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors bg-background ${returnImages ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${returnImages ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                            <FiUpload className="w-5 h-5" />
                                        </div>
                                        <p className="font-medium text-foreground mb-1">
                                            {returnImages ? `${returnImages.length} Files Selected` : "Drop images or click to upload"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Clear photos showing the issue will speed up approval.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleReturnSubmit}
                                disabled={submitting}
                                className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-4"
                            >
                                {submitting ? <div className="w-5 h-5 rounded-full border-2 border-background/30 border-t-background animate-spin" /> : "Submit Return Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
