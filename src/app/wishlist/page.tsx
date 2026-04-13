"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Heart, ArrowRight, Package, ArrowLeft, ShoppingCart, Info, Store as StoreIcon } from "lucide-react"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"
import Loader from "@/src/components/Loader"

export default function WishlistPage() {
    const [loading, setLoading] = useState(true)
    const [wishlistItems, setWishlistItems] = useState([])

    const fetchWishlistItems = async () => {
        try {
            const response = await axios.get("/api/wishlist")
            if (response.data.success) {
                setWishlistItems(response.data.data)
            }
        } catch (error: any) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Failed to fetch wishlist")
            }
        } finally {
            setLoading(false)
        }
    }

    const removeFromWishlist = async (id: string, name: string) => {
        try {
            const response = await axios.delete(`/api/wishlist?id=${id}`)
            if (response.data.success) {
                toast.success(`${name} removed from wishlist`)
                setWishlistItems(wishlistItems.filter((item: any) => item._id !== id))
            }
        } catch (error: any) {
            toast.error("Failed to remove item")
        }
    }

    const moveToCart = async (productId: string, wishlistId: string, name: string) => {
        try {
            const response = await axios.post("/api/wishlist/move-to-cart", { productId, wishlistId })
            if (response.data.success) {
                toast.success(`${name} moved to cart!`)
                setWishlistItems(wishlistItems.filter((item: any) => item._id !== wishlistId))
            }
        } catch (error: any) {
            toast.error("Failed to move item to cart")
        }
    }

    useEffect(() => {
        fetchWishlistItems()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:-translate-x-1 duration-200">
                        <ArrowLeft className="w-4 h-4" /> Continue Shopping
                    </Link>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mt-4 flex items-center gap-3">
                        My Wishlist <span className="text-primary bg-primary/10 text-xl px-3 py-1 rounded-full">{wishlistItems.length}</span>
                    </h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-border rounded-3xl mt-8 shadow-sm">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Heart className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Your Wishlist is empty</h3>
                        <p className="text-muted-foreground w-full max-w-sm mb-8">
                            Save items you love to your wishlist and they'll show up here.
                        </p>
                        <Link 
                            href="/" 
                            className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all font-medium shadow-md flex items-center gap-2 text-lg"
                        >
                            Explore Products <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                        {wishlistItems.map((item: any) => (
                            <div key={item._id} className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
                                {/* Image */}
                                <div className="relative aspect-square bg-muted overflow-hidden">
                                    {item.productId.image ? (
                                        <Image
                                            src={item.productId.image}
                                            alt={item.productId.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground/30" /></div>
                                    )}
                                    <button 
                                        onClick={() => removeFromWishlist(item._id, item.productId.name)}
                                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-primary uppercase tracking-widest">
                                        {item.productId.category || "General"}
                                        {item.productId.storeId?.name && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="flex items-center gap-1">
                                                    <StoreIcon className="w-3 h-3" /> {item.productId.storeId.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-1">
                                        {item.productId.name}
                                    </h3>
                                    <div className="text-xl font-black text-foreground mb-6">
                                        Rs. {item.productId.price.toLocaleString()}
                                    </div>
                                    
                                    <div className="mt-auto flex flex-col gap-3">
                                        <button 
                                            onClick={() => moveToCart(item.productId._id, item._id, item.productId.name)}
                                            className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Move to Cart
                                        </button>
                                        <Link 
                                            href={`/products/productinfo?id=${item.productId._id}`}
                                            className="w-full py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all text-center text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
