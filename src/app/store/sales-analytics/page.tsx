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
                <div className="flex items-center gap-4 w-full max-w-7xl mx-auto pl-2">
                    <Link href="/store/dashboard" className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Sales Analytics</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Intelligence Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Total Revenue */}
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10 group-hover:bg-green-500/20 transition-colors duration-500" />
                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <FiDollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Net Revenue</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                            Rs. {data?.totalRevenue?.toLocaleString() || 0}
                        </h2>
                        <p className="text-sm text-green-600 flex items-center gap-2 font-medium bg-green-500/10 py-1.5 px-3 rounded-lg inline-flex">
                            <FiTrendingUp className="w-4 h-4" /> Delivered & Verified
                        </p>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10 group-hover:bg-primary/20 transition-colors duration-500" />
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <FiPackage className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Total Volume</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                            {data?.productWiseSales?.reduce((acc: number, curr: any) => acc + curr.totalQuantity, 0) || 0}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium py-1.5 break-words">
                            Total physical items sold and dispatched
                        </p>
                    </div>

                    {/* Top Performer */}
                    {topSellingProduct ? (
                        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10 group-hover:bg-orange-500/20 transition-colors duration-500" />
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <FiBarChart2 className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Top Performer</span>
                            <h2 className="text-xl font-extrabold text-foreground mb-4 truncate" title={topSellingProduct.name}>
                                {topSellingProduct.name}
                            </h2>
                            <p className="text-sm text-orange-600 flex items-center gap-2 font-medium bg-orange-500/10 py-1.5 px-3 rounded-lg inline-flex">
                                Lead volume: {topSellingProduct.totalQuantity} units
                            </p>
                        </div>
                    ) : (
                        <div className="bg-surface border border-dashed border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
                            <FiShoppingBag className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground text-sm font-medium">No sales data yet</p>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Inventory Item</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-right">Volume</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-right">Revenue Contribution</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.productWiseSales.map((product: any) => (
                                        <tr key={product.productId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-background">
                                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                    <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]" title={product.name}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-foreground">{product.totalQuantity}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">Units Sold</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-foreground text-lg">Rs. {product.totalRevenue.toLocaleString()}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">Total Yield</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
