"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiXCircle, FiPackage, FiCheckCircle, FiTruck, FiRefreshCcw, FiPrinter, FiX, FiInfo, FiCreditCard } from "react-icons/fi"
import Loader from "@/src/components/Loader"
import { toast } from "react-hot-toast"

export default function TrackOrdersView() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<"new" | "progress" | "completed">("new")
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const { data } = await axios.get("/api/store")
                if (data.success) {
                    if (data.store.status !== "approved" && data.store.status !== "frozen") {
                        router.push("/store/create")
                        return false
                    }
                    setStore(data.store)
                    return true
                }
                return false
            } catch {
                router.push("/store/create")
                return false
            }
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get("/api/orders")
                if (data.success) setOrders(data.orders)
            } catch (error) {
                console.error("Failed to fetch orders:", error)
            } finally {
                setLoading(false)
            }
        }

        const initialize = async () => {
            const hasStore = await fetchStore()
            if (hasStore) await fetchOrders()
            else setLoading(false)
        }

        initialize()
    }, [router])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get("/api/orders")
            if (data.success) setOrders(data.orders)
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setIsUpdating(true)
        try {
            const { data } = await axios.patch("/api/orders", { orderId, status: newStatus })
            if (data.success) {
                toast.success(`Order moved to ${newStatus}`)
                await fetchOrders()
                closeOrderDetails()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update order status")
        } finally {
            setIsUpdating(false)
        }
    }

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeOrderDetails = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedOrder(null), 300)
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
                    <h1 className="text-3xl font-bold text-foreground mb-4">Your Store is Frozen</h1>
                    <p className="text-muted-foreground mb-8 text-lg">This store has been temporarily suspended. You cannot manage orders at this time.</p>
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

    const filteredOrders = orders.filter(order => order.status === activeTab)

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 pl-2">
                    <Link href="/store/dashboard" className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted shrink-0 hidden sm:block">
                        <Image src={store.logo} alt={store.name} fill className="object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground">{store.name}</h1>
                        <p className="text-xs text-muted-foreground">Order Management</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-muted/50 p-1.5 rounded-xl w-full sm:w-auto border border-border">
                        <button 
                            onClick={() => setActiveTab("new")}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'new' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <FiPackage className={activeTab === 'new' ? 'text-primary' : ''} /> 
                            New
                        </button>
                        <button 
                            onClick={() => setActiveTab("progress")}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'progress' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <FiTruck className={activeTab === 'progress' ? 'text-blue-500' : ''} /> 
                            Progress
                        </button>
                        <button 
                            onClick={() => setActiveTab("completed")}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'completed' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <FiCheckCircle className={activeTab === 'completed' ? 'text-green-500' : ''} /> 
                            Completed
                        </button>
                    </div>
                    
                    <Link href="/store/return-orders" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-semibold rounded-xl transition-all whitespace-nowrap">
                        <FiRefreshCcw /> Returns
                        {orders.some(o => o.returnStatus === 'processing') && (
                            <span className="flex h-2 w-2 relative ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground capitalize mb-2">{activeTab} Orders</h2>
                        <p className="text-muted-foreground text-sm">
                            {activeTab === "new" && "Review and accept incoming requests"}
                            {activeTab === "progress" && "Orders currently being processed or on their way"}
                            {activeTab === "completed" && "Successfully delivered and closed orders"}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
                        <span className="text-lg font-bold text-foreground">{filteredOrders.length}</span>
                    </div>
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                                {activeTab === "new" && <div className="absolute top-0 right-0 w-2 h-full bg-primary/80" />}
                                {activeTab === "progress" && <div className="absolute top-0 right-0 w-2 h-full bg-blue-500/80" />}
                                {activeTab === "completed" && <div className="absolute top-0 right-0 w-2 h-full bg-green-500/80" />}
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                                        <h3 className="text-lg font-bold text-foreground">#{order._id.slice(-8).toUpperCase()}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide
                                        ${order.status === 'new' ? 'bg-primary/10 text-primary border border-primary/20' : 
                                          order.status === 'progress' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 
                                          'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-3 mb-8 flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Customer:</span>
                                        <span className="font-semibold text-foreground truncate max-w-[150px]" title={order.receiverName}>{order.receiverName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Items:</span>
                                        <span className="font-medium text-foreground">{order.quantity} units</span>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-border flex justify-between items-center mt-auto">
                                    <span className="font-extrabold text-foreground text-lg">Rs. {order.totalAmount.toLocaleString()}</span>
                                    <button 
                                        onClick={() => openOrderDetails(order)}
                                        className="px-5 py-2.5 bg-background border border-border hover:bg-muted text-foreground font-semibold text-sm rounded-xl transition-colors shrink-0"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface border border-dashed border-border rounded-3xl py-24 flex flex-col items-center justify-center text-center px-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
                            activeTab === 'new' ? 'bg-primary/10 text-primary' :
                            activeTab === 'progress' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-green-500/10 text-green-500'
                        }`}>
                            {activeTab === "new" && <FiPackage className="w-10 h-10" />}
                            {activeTab === "progress" && <FiTruck className="w-10 h-10" />}
                            {activeTab === "completed" && <FiCheckCircle className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 capitalize">No {activeTab} Orders</h3>
                        <p className="text-muted-foreground max-w-sm">There are currently no orders in this category. Check back later.</p>
                    </div>
                )}
            </main>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div onClick={closeOrderDetails} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    Order Details <span className="opacity-50 font-normal text-sm">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                                </h3>
                            </div>
                            <button onClick={closeOrderDetails} className="p-2 bg-background border border-border rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto hidden-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider"><FiInfo /> Customer Info</h4>
                                    <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 shadow-sm h-full">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Name</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.receiverName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.mobileNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Shipping Address</p>
                                            <p className="font-semibold text-foreground break-words">{selectedOrder.billingAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider"><FiPackage /> Product Info</h4>
                                    <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 shadow-sm h-full">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Item</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.productId?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Quantity</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.quantity} units</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Payment Method</p>
                                            <p className="font-semibold text-foreground flex items-center gap-2">
                                                <FiCreditCard className="text-primary" />
                                                {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex justify-between items-center mb-2">
                                <span className="font-extrabold text-foreground uppercase tracking-wider text-sm">Total Value</span>
                                <h2 className="text-3xl font-black text-primary">Rs. {selectedOrder.totalAmount.toLocaleString()}</h2>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between gap-4 mt-auto">
                            <button onClick={() => window.print()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background hover:bg-muted text-foreground font-semibold rounded-xl transition-colors">
                                <FiPrinter /> Print Slip
                            </button>
                            
                            <div className="flex gap-3 w-full sm:w-auto">
                                {activeTab === "new" && (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder._id, "cancelled")}
                                            disabled={isUpdating}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background hover:bg-red-500 hover:text-white hover:border-red-500 text-foreground font-semibold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <FiX /> Decline
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder._id, "progress")}
                                            disabled={isUpdating}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md active:scale-[0.98] disabled:opacity-70 min-w-[170px]"
                                        >
                                            {isUpdating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><FiTruck /> Mark as Shipped</>}
                                        </button>
                                    </>
                                )}
                                {activeTab === "progress" && (
                                    <button
                                        onClick={() => updateOrderStatus(selectedOrder._id, "completed")}
                                        disabled={isUpdating}
                                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-md active:scale-[0.98] disabled:opacity-70 min-w-[200px]"
                                    >
                                        {isUpdating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><FiCheckCircle /> Mark as Delivered</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
