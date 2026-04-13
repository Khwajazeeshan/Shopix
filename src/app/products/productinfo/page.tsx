"use client"
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import dynamic from "next/dynamic"

const Elements = dynamic(() => import('@stripe/react-stripe-js').then(mod => mod.Elements), { ssr: false })
const CardElement = dynamic(() => import('@stripe/react-stripe-js').then(mod => mod.CardElement), { ssr: false })
const StripeCheckoutForm = dynamic(() => Promise.resolve(CheckoutForm), { ssr: false })

import React, { useState, useEffect, Suspense } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag, ShoppingCart, Package, Star, X, CreditCard, Minus, Plus, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { useForm } from "react-hook-form"
import { useAppDispatch } from "@/src/redux/hooks"
import { addToCart } from "@/src/redux/slices/cartSlice"
import Loader from "@/src/components/Loader"
import Navbar from "@/src/components/navbar/page"
import Footer from "@/src/components/footer/page"
import ChatWindow from "@/src/components/chat/ChatWindow"
import { MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!);

type OrderFormInputs = {
    receiverName: string;
    mobileNumber: string;
    billingAddress: string;
    quantity: number;
    paymentMethod: "cod" | "online";
};

function CheckoutForm({ productId, productPrice, maxQuantity, onSuccess, onClose }: {
    productId: string, productPrice: number, maxQuantity: number, onSuccess: () => void, onClose: () => void
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<OrderFormInputs>({
        defaultValues: { quantity: 1, paymentMethod: "cod" }
    });

    const paymentMethod = watch("paymentMethod");
    const quantity = watch("quantity");
    const totalAmount = productPrice * (quantity || 1);

    const onSubmitOrder = async (formData: OrderFormInputs) => {
        setIsSubmitting(true);
        try {
            let stripePaymentId = null;

            if (formData.paymentMethod === "online") {
                if (!stripe || !elements) {
                    toast.error("Stripe.js has not loaded yet.");
                    return;
                }
                const cardElement = elements.getElement('card');
                if (!cardElement) return;

                const { data: intentData } = await axios.post("/api/create-payment-intent", { amount: totalAmount });
                if (!intentData.success) throw new Error(intentData.error || "Failed to create payment intent");

                const result = await stripe.confirmCardPayment(intentData.clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: { name: formData.receiverName, address: { line1: formData.billingAddress } },
                    },
                });

                if (result.error) { toast.error(result.error.message || "Payment failed"); return; }
                if (result.paymentIntent.status === "succeeded") stripePaymentId = result.paymentIntent.id;
            }

            const response = await axios.post("/api/orders", {
                productId, ...formData, stripePaymentId,
                paymentStatus: formData.paymentMethod === "online" ? "Paid" : "Pending"
            });

            if (response.data.success) {
                toast.success("Order placed successfully!");
                onSuccess();
                reset();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitOrder)} className="space-y-5 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium text-foreground">Receiver Name</label>
                    <input 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        placeholder="John Doe"
                        {...register("receiverName", { required: "Name is required" })} 
                    />
                    {errors.receiverName && <p className="text-destructive text-xs mt-1">{errors.receiverName.message}</p>}
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-sm font-medium text-foreground">Mobile Number</label>
                    <input 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        placeholder="+1 234 567 8900"
                        {...register("mobileNumber", {
                            required: "Mobile number is required",
                            minLength: { value: 10, message: "Min 10 digits" }
                        })} 
                    />
                    {errors.mobileNumber && <p className="text-destructive text-xs mt-1">{errors.mobileNumber.message}</p>}
                </div>
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                <label className="text-sm font-medium text-foreground">Delivery Address</label>
                <input 
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="123 Main St, Apt 4B, New York, NY 10001"
                    {...register("billingAddress", { required: "Address is required" })} 
                />
                {errors.billingAddress && <p className="text-destructive text-xs mt-1">{errors.billingAddress.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex justify-between">
                    <span>Quantity</span>
                    <span className="text-muted-foreground font-normal">{maxQuantity} available</span>
                </label>
                <div className="flex items-center gap-4 bg-surface w-fit border border-border rounded-xl p-1">
                    <button 
                        type="button" 
                        onClick={() => setValue("quantity", Math.max(1, quantity - 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button 
                        type="button" 
                        onClick={() => setValue("quantity", Math.min(maxQuantity, quantity + 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <input type="hidden" {...register("quantity", { required: true, min: 1, max: maxQuantity })} />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-foreground">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        onClick={() => setValue("paymentMethod", "cod")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'cod' ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                        }`}
                    >
                        <Package className={`w-6 h-6 mb-2 ${paymentMethod === 'cod' ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">Cash on Delivery</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setValue("paymentMethod", "online")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'online' ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                        }`}
                    >
                        <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'online' ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">Pay Online</span>
                    </button>
                    <input type="hidden" {...register("paymentMethod")} />
                </div>
            </div>

            {paymentMethod === "online" && (
                <div className="p-4 bg-surface border border-border rounded-xl space-y-3 drop-shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment via Stripe
                    </div>
                    <div className="bg-white px-3 py-3 rounded-lg border border-border">
                        <CardElement options={{
                            style: {
                                base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                                invalid: { color: '#9e2146' },
                            },
                        }} />
                    </div>
                </div>
            )}

            <div className="pt-4 mt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Total to pay</p>
                    <p className="text-2xl font-bold text-primary">Rs. {totalAmount.toLocaleString()}</p>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting || (paymentMethod === "online" && !stripe)}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...
                        </div>
                    ) : "Confirm Order"}
                </button>
            </div>
        </form>
    );
}

function ProductContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const productId = searchParams.get("id");

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [chatConversationId, setChatConversationId] = useState<string | null>(null)
    const [showChat, setShowChat] = useState(false)
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(6)
    const { data: session }: any = useSession()

    const fetchProductDetails = async () => {
        if (!productId) return;
        try {
            const response = await fetch(`/api/marketplace/products/${productId}`, { next: { revalidate: 300 } });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                toast.error(result.error || "Failed to fetch product details");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch product details");
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async () => {
        if (!data) return;
        setIsAdding(true)
        try {
            const response = await axios.post("/api/cart", { productId })
            if (response.data.success) {
                dispatch(addToCart({ 
                    id: data.product._id, 
                    name: data.product.name, 
                    price: data.product.price, 
                    quantity: 1, 
                    imageUrl: data.product.image 
                }));
                toast.success("Added to your items!")
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.success("Temporarily added to cart. Login to sync!");
                dispatch(addToCart({ 
                    id: data.product._id, 
                    name: data.product.name, 
                    price: data.product.price, 
                    quantity: 1, 
                    imageUrl: data.product.image 
                }));
            } else {
                toast.error(error.response?.data?.error || "Failed to add to cart");
            }
        } finally {
            setIsAdding(false)
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const { data: revData } = await axios.post("/api/reviews", { productId, rating: reviewRating, comment: reviewComment });
            if (revData.success) {
                toast.success("Review published!");
                setShowReviewModal(false);
                setReviewComment("");
                setReviewRating(5);
                fetchProductDetails();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "You must be logged in to review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleStartChat = async () => {
        if (!session) {
            toast.error("Please login to chat with seller");
            router.push("/auth/login");
            return;
        }

        try {
            const response = await axios.post("/api/chat/conversation", {
                sellerId: product.sellerId,
                productId: product._id
            });

            if (response.data.success) {
                setChatConversationId(response.data.conversation._id);
                setShowChat(true);
            }
        } catch (error: any) {
            toast.error("Failed to start conversation");
        }
    };

    useEffect(() => {
        if (productId) fetchProductDetails()
    }, [productId])

    useEffect(() => {
        if (searchParams.get("openChat") === "true" && data && session) {
            handleStartChat();
        }
    }, [searchParams, data, session]);

    if (loading) return <Loader />
    if (!data) return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
                <p className="text-muted-foreground max-w-md mb-8">The item you are looking for might have been removed, or the link is broken.</p>
                <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium">
                    Back to Marketplace
                </Link>
            </div>
            <Footer />
        </div>
    )

    const { product, reviews } = data

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Breadcrumb */}
                <div className="mb-6 lg:mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:-translate-x-1 duration-200">
                        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Left: Product Image */}
                    <div className="flex flex-col gap-4 sticky top-24 h-fit">
                        <div className="relative w-full aspect-[4/5] md:aspect-[1/1] bg-surface rounded-3xl overflow-hidden border border-border shadow-sm group">
                            {product.image ? (
                                <Image 
                                    src={product.image} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <Package className="w-16 h-16 opacity-50" />
                                </div>
                            )}
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.sold > 50 && (
                                    <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                                        Top Seller
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col lg:pl-4">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                                <ShieldCheck className="w-4 h-4" /> Authentic Item
                                <span className="text-muted-foreground px-2">|</span>
                                <span className="text-foreground">{product.category || "General"}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-muted'}`} />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-foreground ml-1">{(product.rating || 0).toFixed(1)}</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                <button 
                                    onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                                >
                                    {reviews?.length || 0} reviews
                                </button>
                                {product.sold > 0 && (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {product.sold} units sold
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="h-px w-full bg-border mb-6" />

                        <div className="mb-8">
                            <span className="block text-sm font-medium text-muted-foreground mb-1">Price</span>
                            <div className="text-4xl font-black text-foreground mb-6">
                                Rs. {product.price.toLocaleString()}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description || "No description provided for this product."}
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                                <div className="bg-background p-2 rounded-lg text-primary shadow-sm">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-foreground">Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                                <div className="bg-background p-2 rounded-lg text-primary shadow-sm">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-foreground">7 Days Return</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-surface border border-border p-5 rounded-2xl mb-8 flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-foreground flex items-center gap-2">
                                    Availability
                                </span>
                                <span className={`font-medium ${product.quantity > 0 ? "text-green-600" : "text-destructive"}`}>
                                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <button
                                    onClick={() => setShowOrderModal(true)}
                                    disabled={product.quantity === 0}
                                    className="w-full py-4 px-6 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Buy Now
                                </button>
                                <button
                                    onClick={handleStartChat}
                                    className="w-full py-4 px-6 bg-secondary/10 text-secondary border border-secondary/20 font-semibold rounded-xl hover:bg-secondary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-5 h-5" /> Chat with Seller
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding || product.quantity === 0}
                                    className="w-full py-4 px-6 bg-primary/10 text-primary border border-primary/20 font-semibold rounded-xl hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag className="w-5 h-5" /> 
                                    {isAdding ? "Adding..." : "Add to Cart"}
                                </button>
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border bg-muted">
                                    {product.storeId?.logo ? (
                                        <Image src={product.storeId?.logo} alt="Store" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-lg text-muted-foreground">
                                            {product.storeId?.name?.[0] || "S"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sold by</p>
                                    <Link href="#" className="font-bold text-lg text-foreground hover:text-primary transition-colors">
                                        {product.storeId?.name || "Unknown Store"}
                                    </Link>
                                </div>
                            </div>
                            <Link href="#" className="px-4 py-2 text-sm font-medium border border-border rounded-full hover:bg-muted transition-colors">
                                Visit Store
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div id="reviews" className="mt-24 pt-16 border-t border-border scroll-mt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Community Reviews</h2>
                            <p className="text-muted-foreground">Ratings and unedited feedback from verified buyers.</p>
                        </div>
                        <button 
                            onClick={() => setShowReviewModal(true)}
                            className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Star className="w-4 h-4" /> Write a Review
                        </button>
                    </div>

                    {!reviews || reviews.length === 0 ? (
                        <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
                            <p className="text-muted-foreground max-w-md">Be the first to share your experience with this product. Your feedback helps other shoppers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.slice(0, visibleReviewsCount).map((review: any) => (
                                <div key={review._id} className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl border border-primary/20">
                                            {review.userId?.name?.[0] || "A"}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{review.userId?.name || "Anonymous User"}</h4>
                                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-500 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed truncate-multiline">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {reviews && reviews.length > 6 && (
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() => setVisibleReviewsCount(visibleReviewsCount === 6 ? reviews.length : 6)}
                                className="px-8 py-3 rounded-full border border-border bg-surface hover:bg-muted font-semibold text-foreground transition-all hover:shadow-md active:scale-[0.98]"
                            >
                                {visibleReviewsCount === 6 ? "Show More Reviews" : "Hide Reviews"}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowReviewModal(false)} 
                    />
                    <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col">
                        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                            <h2 className="text-lg font-semibold text-foreground">Share Experience</h2>
                            <button onClick={() => setShowReviewModal(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                            <div>
                                <p className="text-sm font-medium text-foreground mb-3 text-center">Tap a star to rate</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            onClick={() => setReviewRating(star)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Write your thoughts</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full resize-none bg-surface border border-border rounded-xl p-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                                    placeholder="What did you think of the product? Did it meet expectations?"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmittingReview}
                                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSubmittingReview ? "Publishing..." : "Submit Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
                        onClick={() => setShowOrderModal(false)} 
                    />
                    <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-primary" /> Secure Checkout
                            </h2>
                            <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {/* Order Summary Miniature */}
                            <div className="flex items-center gap-4 p-4 mb-6 rounded-xl border border-border bg-surface">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                                    <p className="text-primary font-bold">Rs. {product.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <Elements stripe={stripePromise}>
                                <StripeCheckoutForm
                                    productId={productId!}
                                    productPrice={product.price}
                                    maxQuantity={product.quantity}
                                    onSuccess={fetchProductDetails}
                                    onClose={() => setShowOrderModal(false)}
                                />
                            </Elements>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Chat Window */}
            {showChat && chatConversationId && (
                <ChatWindow
                    conversationId={chatConversationId}
                    productInfo={{
                        name: product.name,
                        image: product.image,
                        price: product.price
                    }}
                    sellerInfo={{
                        name: product.storeId.name,
                        image: product.storeId.logo
                    }}
                    currentUserRole="customer"
                    onClose={() => setShowChat(false)}
                />
            )}
            
            <Footer />
        </div>
    )
}

export default function ProductInfo() {
    return (
        <Suspense fallback={<Loader />}>
            <ProductContent />
        </Suspense>
    )
}
