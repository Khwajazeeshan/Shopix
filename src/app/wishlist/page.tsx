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
                <div className="mb-6 sm:mb-8">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] sm:text-sm font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Return to Market
                    </Link>
                    <h1 className="text-xl sm:text-4xl font-black text-foreground tracking-tighter mt-3 sm:mt-4 flex items-center gap-2 uppercase">
                        My Wishlist <span className="text-primary bg-primary/10 text-xs sm:text-lg px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{wishlistItems.length}</span>
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
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 mt-6 sm:mt-8">
                        {wishlistItems.map((item: any) => (
                            <div key={item._id} className="group flex flex-col bg-surface rounded-xl sm:rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
                                {/* Image */}
                                <div className="relative aspect-[4/5] sm:aspect-square bg-muted/50 overflow-hidden">
                                    {item.productId.image ? (
                                        <Image
                                            src={item.productId.image}
                                            alt={item.productId.name}
                                            fill
                                            className="object-contain p-1.5 sm:p-4 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground/30" /></div>
                                    )}
                                    <button 
                                        onClick={() => removeFromWishlist(item._id, item.productId.name)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm z-10"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-2.5 sm:p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 text-[8px] sm:text-xs font-black text-primary uppercase tracking-tighter sm:tracking-widest truncate">
                                        {item.productId.category || "General"}
                                        {item.productId.storeId?.name && (
                                            <>
                                                <span className="w-0.5 h-0.5 rounded-full bg-border" />
                                                <span className="flex items-center gap-0.5 truncate">
                                                    <StoreIcon className="w-2.5 h-2.5" /> {item.productId.storeId.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-foreground text-xs sm:text-lg mb-1 sm:mb-2 line-clamp-1">
                                        {item.productId.name}
                                    </h3>
                                    <div className="text-sm sm:text-xl font-black text-foreground mb-3 sm:mb-6">
                                        <span className="text-[10px] sm:text-sm text-primary font-bold mr-0.5">Rs.</span>
                                        {item.productId.price.toLocaleString()}
                                    </div>
                                    
                                    <div className="mt-auto flex flex-col gap-1.5 sm:gap-3">
                                        <button 
                                            onClick={() => moveToCart(item.productId._id, item._id, item.productId.name)}
                                            className="w-full py-2 sm:py-3 bg-foreground text-background font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl hover:bg-foreground/90 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Move
                                        </button>
                                        <Link 
                                            href={`/products/productinfo?id=${item.productId._id}`}
                                            className="w-full py-2 sm:py-3 border border-border text-foreground font-bold rounded-lg sm:rounded-xl hover:bg-muted transition-all text-center text-[10px] sm:text-xs"
                                        >
                                            Details
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
