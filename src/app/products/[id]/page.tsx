"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiShoppingBag, FiPackage, FiStar, FiUser, FiCheckCircle } from "react-icons/fi"
import Loader from "@/src/components/Loader"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"

export default function ProductInfo({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const productId = resolvedParams.id;

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`/api/marketplace/products/${productId}`)
            if (response.data.success) {
                setData(response.data.data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch product details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProductDetails()
    }, [productId])

    if (loading) return <Loader />

    if (!data) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FiPackage className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground max-w-md mb-8">The item you are looking for might have been removed or does not exist.</p>
            <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium">
                Back to Marketplace
            </Link>
        </div>
    )

    const { product, reviews } = data

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-6 lg:mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:-translate-x-1 duration-200">
                        <FiArrowLeft className="w-4 h-4" /> Back to Marketplace
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    <div className="flex flex-col gap-4 sticky top-24 h-fit">
                        <div className="relative w-full aspect-[4/5] md:aspect-[1/1] bg-surface rounded-3xl overflow-hidden border border-border shadow-sm group">
                            {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <FiPackage className="w-16 h-16 opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                <FiCheckCircle className="w-3.5 h-3.5 text-primary" />
                                <span>Verified Authentic</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:pl-4">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                                {product.storeId?.name}
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="h-px w-full bg-border mb-6" />

                        <div className="mb-8 flex flex-wrap gap-8">
                            <div>
                                <span className="block text-sm font-medium text-muted-foreground mb-1">Market Price</span>
                                <p className="text-4xl font-black text-foreground">Rs. {product.price.toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-muted-foreground mb-1">Inventory</span>
                                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-muted rounded-lg text-sm font-semibold">
                                    <FiPackage className="w-4 h-4 text-primary" />
                                    <p>{product.quantity} Units Available</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <button className="w-full py-4 px-6 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-all shadow-lg flex items-center justify-center gap-2 text-lg">
                                Order Now
                            </button>
                            <button className="w-full py-4 px-6 bg-primary/10 text-primary border border-primary/20 font-semibold rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2 text-lg">
                                <FiShoppingBag className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-16 border-t border-border">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Community Reviews</h2>
                            <p className="text-muted-foreground">See what others are saying about this product.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-surface border border-border px-6 py-3 rounded-2xl shadow-sm">
                            <FiStar className="w-6 h-6 text-yellow-500 fill-current" />
                            <span className="text-2xl font-black">{reviews.length > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest pl-2 border-l border-border">Avg Rating</span>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FiStar className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
                            <p className="text-muted-foreground max-w-md">Be the first to share your experience with this product!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review: any) => (
                                <div key={review._id} className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl border border-primary/20">
                                            <FiUser className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{review.userId?.name || "Anonymous User"}</h4>
                                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-500 mb-3 gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
