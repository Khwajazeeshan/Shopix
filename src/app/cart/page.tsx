"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, ArrowRight, Package, ArrowLeft, ShoppingCart, ShieldCheck, Tag, Info } from "lucide-react"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"
import Loader from "@/src/components/Loader"

export default function MyItemsPage() {
    const [loading, setLoading] = useState(true)
    const [cartItems, setCartItems] = useState([])

    const fetchCartItems = async () => {
        try {
            const response = await axios.get("/api/cart")
            if (response.data.success) {
                setCartItems(response.data.data)
            }
        } catch (error: any) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.error || "Failed to fetch items")
            }
        } finally {
            setLoading(false)
        }
    }

    const removeFromCart = async (id: string, name: string) => {
        try {
            const response = await axios.delete(`/api/cart?id=${id}`)
            if (response.data.success) {
                toast.success(`${name} removed`)
                setCartItems(cartItems.filter((item: any) => item._id !== id))
            }
        } catch (error: any) {
            toast.error("Failed to remove item")
        }
    }

    useEffect(() => {
        fetchCartItems()
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

    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.productId.price, 0)

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:-translate-x-1 duration-200">
                        <ArrowLeft className="w-4 h-4" /> Continue Shopping
                    </Link>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mt-4 flex items-center gap-3">
                        Shopping Bag <span className="text-primary bg-primary/10 text-xl px-3 py-1 rounded-full">{cartItems.length}</span>
                    </h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-border rounded-3xl mt-8">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Your Bag is empty</h3>
                        <p className="text-muted-foreground w-full max-w-sm mb-8">
                            Looks like you haven't added anything to your bag yet. Discover top products from our merchants.
                        </p>
                        <Link 
                            href="/" 
                            className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all font-medium shadow-md flex items-center gap-2 text-lg"
                        >
                            Start Shopping <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-8">
                        {/* Cart Items List */}
                        <div className="col-span-1 lg:col-span-8 space-y-4">
                            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <div className="col-span-6">Product Details</div>
                                    <div className="col-span-3 text-center">Summary</div>
                                    <div className="col-span-3 text-right">Actions</div>
                                </div>
                                <div className="divide-y divide-border">
                                    {cartItems.map((item: any) => (
                                        <div key={item._id} className="p-4 sm:p-6 hover:bg-muted/10 transition-colors group">
                                            <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-center">
                                                
                                                <div className="col-span-1 md:col-span-6 flex w-full items-start gap-4">
                                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
                                                        {item.productId.image ? (
                                                            <Image
                                                                src={item.productId.image}
                                                                alt={item.productId.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex justify-center items-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                                            <span>{item.productId.category || "General"}</span>
                                                            {item.productId.storeId?.name && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                                    <span className="text-primary flex items-center gap-1 group/store hover:underline underline-offset-4">
                                                                        <StoreIcon className="w-3 h-3" />
                                                                        {item.productId.storeId.name}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <Link href={`/products/productinfo?id=${item.productId._id}`} className="group-hover:text-primary transition-colors">
                                                            <h3 className="font-bold text-foreground text-lg sm:text-xl line-clamp-2 leading-tight">
                                                                {item.productId.name}
                                                            </h3>
                                                        </Link>
                                                        <div className="mt-2 text-primary font-black text-lg md:hidden">
                                                            Rs. {item.productId.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-1 md:col-span-3 w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center">
                                                    <div className="hidden md:block text-foreground font-bold text-lg mb-1">
                                                        Rs. {item.productId.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground bg-surface border border-border px-2.5 py-1 rounded-md flex items-center gap-1.5 self-start md:self-center w-full justify-center">
                                                        <Info className="w-3.5 h-3.5" /> 
                                                        Added {new Date(item.createdAt).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}
                                                    </div>
                                                </div>

                                                <div className="col-span-1 md:col-span-3 w-full flex md:flex-col justify-end gap-3 mt-4 md:mt-0">
                                                    <Link 
                                                        href={`/products/productinfo?id=${item.productId._id}`} 
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground hover:bg-muted font-medium text-sm rounded-lg transition-colors"
                                                    >
                                                        View Product
                                                    </Link>
                                                    <button
                                                        onClick={() => removeFromCart(item._id, item.productId.name)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white font-medium text-sm rounded-lg transition-colors border border-transparent hover:border-destructive/50"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Remove
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="col-span-1 lg:col-span-4 block sticky top-24">
                            <div className="bg-surface border border-border rounded-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
                                
                                <h2 className="text-xl font-bold tracking-tight text-foreground mb-6 uppercase flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" /> Order Summary
                                </h2>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-medium">Subtotal ({cartItems.length} items)</span>
                                        <span className="text-foreground font-semibold">Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-medium flex items-center gap-1.5">Shipping Fee <Info className="w-3.5 h-3.5" /></span>
                                        <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-md border border-green-100">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-medium">Estimated Taxes</span>
                                        <span className="text-foreground font-semibold">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-border border-dashed mb-6" />

                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-lg font-bold text-foreground">Total Amount</span>
                                    <span className="text-3xl font-black text-primary">Rs. {subtotal.toLocaleString()}</span>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background font-bold text-lg rounded-xl hover:bg-foreground/90 transition-all hover:-translate-y-0.5 shadow-lg active:scale-[0.98]">
                                    Checkout Securely <ArrowRight className="w-5 h-5" />
                                </button>
                                
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600 font-medium bg-green-50/50 p-3 rounded-lg border border-green-100/50">
                                    <ShieldCheck className="w-5 h-5" /> 
                                    <span>Encrypted & Secure Checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    )
}

function StoreIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  )
}
