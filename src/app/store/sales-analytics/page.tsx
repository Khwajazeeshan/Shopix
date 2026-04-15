"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { FiArrowLeft, FiBarChart2, FiDollarSign, FiPackage, FiTrendingUp, FiShoppingBag, FiInfo } from "react-icons/fi"
import toast from "react-hot-toast"
import Loader from "@/src/components/Loader"

export default function SalesAnalytics() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get("/api/store/sales-analytics")
                if (response.data.success) {
                    setData(response.data)
                } else {
                    toast.error(response.data.error || "Failed to fetch analytics")
                }
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Error loading sales data")
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader />
            </div>
        )
    }

    const topSellingProduct = data?.productWiseSales?.length > 0 
        ? [...data.productWiseSales].sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)[0]
        : null;

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            {/* Header */}
            <header className="w-full bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-8 h-20 flex items-center shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4 w-full max-w-7xl mx-auto pl-1 sm:pl-2">
                    <Link href="/store/dashboard" className="p-1.5 sm:p-2 border border-border rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1 sm:mr-2">
                        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tighter sm:tracking-normal">Sales Analytics</h1>
                        <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block font-black uppercase tracking-widest">Intelligence Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10">
                    {/* Total Revenue */}
                    <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 text-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
                            <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Net Revenue</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-foreground mb-4">
                            Rs. {data?.totalRevenue?.toLocaleString() || 0}
                        </h2>
                        <p className="text-[10px] sm:text-sm text-green-600 flex items-center gap-1.5 font-black bg-green-500/10 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg inline-flex uppercase tracking-tighter sm:tracking-normal">
                            <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Delivered & Verified
                        </p>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
                            <FiPackage className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Total Volume</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-foreground mb-4">
                            {data?.productWiseSales?.reduce((acc: number, curr: any) => acc + curr.totalQuantity, 0) || 0}
                        </h2>
                        <p className="text-[10px] sm:text-sm text-muted-foreground font-black py-1 uppercase tracking-widest opacity-60">
                            Volume items sold
                        </p>
                    </div>

                    {/* Top Performer */}
                    {topSellingProduct ? (
                        <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10" />
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 text-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
                                <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Top Performer</span>
                            <h2 className="text-base sm:text-xl font-black text-foreground mb-4 truncate uppercase" title={topSellingProduct.name}>
                                {topSellingProduct.name}
                            </h2>
                            <p className="text-[10px] sm:text-sm text-orange-600 flex items-center gap-1.5 font-black bg-orange-500/10 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg inline-flex uppercase tracking-tighter sm:tracking-normal">
                                {topSellingProduct.totalQuantity} Units Sold
                            </p>
                        </div>
                    ) : (
                        <div className="bg-surface border border-dashed border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
                            <FiShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground text-[10px] sm:text-sm font-black uppercase tracking-widest">No data yet</p>
                        </div>
                    )}
                </div>

                {/* Product Breakdown Container */}
                <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 sm:p-8 border-b border-border bg-muted/20">
                        <h3 className="text-xl font-bold text-foreground">Product Performance</h3>
                        <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of sales per inventory item</p>
                    </div>

                    {data?.productWiseSales?.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Inventory Item</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase tracking-widest text-right">Volume</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase tracking-widest text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data.productWiseSales.map((product: any) => (
                                            <tr key={product.productId} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[200px]">{product.name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20">Active</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-xs text-foreground">{product.totalQuantity} Units</td>
                                                <td className="px-6 py-4 text-right font-black text-sm text-primary">Rs. {product.totalRevenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card Stack */}
                            <div className="sm:hidden divide-y divide-border">
                                {data.productWiseSales.map((product: any) => (
                                    <div key={product.productId} className="p-4 space-y-3 bg-background">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
                                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[10px] font-black uppercase tracking-tight text-foreground truncate">{product.name}</h4>
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">Delivered</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-muted/30 p-2 rounded-lg border border-border">
                                                <span className="block text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Yield</span>
                                                <span className="font-black text-primary text-[11px]">Rs. {product.totalRevenue.toLocaleString()}</span>
                                            </div>
                                            <div className="bg-muted/30 p-2 rounded-lg border border-border text-right">
                                                <span className="block text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Volume</span>
                                                <span className="font-black text-foreground text-[11px]">{product.totalQuantity} Pcs</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-24 px-6 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No verified sales data</h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Complete orders and ensure their delivery to begin generating analytics data.</p>
                            <Link href="/store/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]">
                                Return to Command Center
                            </Link>
                        </div>
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-8 flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed font-medium">
                        Data accuracy is maintained through dynamic synchronization with the global ledger. Revenue figures only reflect successfully delivered parcels and automatically exclude finalized returns.
                    </p>
                </div>
            </main>
        </div>
    )
}
