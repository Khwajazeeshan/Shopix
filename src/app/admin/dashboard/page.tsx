"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiUsers, FiShoppingBag, FiActivity, FiArrowLeft, FiShield } from "react-icons/fi"
import Loader from "@/src/components/Loader"

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)

    const fetchStats = async () => {
        try {
            const response = await axios.get("/api/admin/dashboard")
            if (response.data.success) {
                setStats(response.data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch dashboard stats")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) return <Loader />

    return (
        <div className="min-h-screen bg-background font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <nav className="mb-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-surface px-4 py-2 rounded-lg border border-border w-fit shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </nav>

                <header className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-20 -translate-y-20 group-[&:hover]:bg-primary/10 transition-colors duration-700" />
                    
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                            <FiShield className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">System Administrator</p>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
                        Welcome back, {stats?.admin?.name || "Admin"}
                    </h1>
                    
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                        <div className="bg-background px-5 py-3 rounded-xl border border-border shadow-sm flex-1">
                            <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Website</p>
                            <p className="font-bold text-foreground">Shopix Marketplace</p>
                        </div>
                        <div className="bg-background px-5 py-3 rounded-xl border border-border shadow-sm flex-1">
                            <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Identity</p>
                            <p className="font-bold text-foreground">{stats?.admin?.email}</p>
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                        onClick={() => router.push("/admin/users")}
                        className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -z-10 group-[&:hover]:bg-blue-500/10 transition-colors" />
                        <div className="w-14 h-14 bg-background border border-border text-foreground rounded-2xl flex items-center justify-center mb-6 shadow-sm group-[&:hover]:text-primary transition-colors">
                            <FiUsers className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-muted-foreground mb-1">Total Users Registered</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-5xl font-black text-foreground">{stats?.totalUsers || 0}</p>
                            <p className="text-sm font-semibold text-primary group-[&:hover]:underline underline-offset-4">View All Users &rarr;</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => router.push("/admin/stores")}
                        className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] -z-10 group-[&:hover]:bg-purple-500/10 transition-colors" />
                        <div className="w-14 h-14 bg-background border border-border text-foreground rounded-2xl flex items-center justify-center mb-6 shadow-sm group-[&:hover]:text-primary transition-colors">
                            <FiShoppingBag className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-muted-foreground mb-1">Total Stores Registered</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-5xl font-black text-foreground">{stats?.totalStores || 0}</p>
                            <p className="text-sm font-semibold text-primary group-[&:hover]:underline underline-offset-4">Manage Stores &rarr;</p>
                        </div>
                    </div>
                </section>

                <section className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FiActivity className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Platform Expansion Data</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-4 font-bold text-muted-foreground text-sm uppercase tracking-wider pl-4">Month</th>
                                    <th className="pb-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">New Users</th>
                                    <th className="pb-4 font-bold text-muted-foreground text-sm uppercase tracking-wider pr-4">New Stores</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {stats?.chartData?.length > 0 ? stats.chartData.map((data: any, index: number) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-4 pl-4 font-semibold text-foreground">{data.name}</td>
                                        <td className="py-4 text-foreground font-medium">{data.users}</td>
                                        <td className="py-4 pr-4 text-foreground font-medium">{data.stores}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-muted-foreground font-medium">No expansion data available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="text-center py-6 text-sm text-muted-foreground font-medium">
                    <p>Shopix Systems © 2026 • Enterprise Central Control</p>
                </footer>
            </main>
        </div>
    )
}
