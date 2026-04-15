"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiSettings, FiPackage, FiPlus, FiArrowLeft, FiX, FiUploadCloud, FiTrash2, FiXCircle, FiTruck, FiBarChart2, FiRefreshCcw, FiSearch, FiMenu, FiMessageSquare } from "react-icons/fi"
import Loader from "@/src/components/Loader"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

type ProductFormInputs = {
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: FileList;
}

export default function StoreView() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fetchingProducts, setFetchingProducts] = useState(true)
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to permanently delete this product?")) return;
        setDeletingId(productId);
        try {
            const { data } = await axios.delete(`/api/products/${productId}`);
            if (data.success) {
                toast.success("Product deleted successfully");
                fetchProducts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProductFormInputs>();
    const imageFile = watch("image");
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [imageFile]);

    const onSubmit = async (data: ProductFormInputs) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("price", data.price.toString());
            formData.append("quantity", data.quantity.toString());
            formData.append("image", data.image[0]);
            const response = await axios.post("/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data.success) {
                toast.success("Product added successfully!");
                setShowAddModal(false);
                reset();
                setPreview(null);
                fetchProducts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add product");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const { data } = await axios.get("/api/store")
                if (data.success) {
                    if (data.store.status !== "approved" && data.store.status !== "frozen") {
                        router.push("/store/create")
                        return
                    }
                    setStore(data.store)
                }
            } catch (error: any) {
                router.push("/store/create")
            } finally {
                setLoading(false)
            }
        }
        fetchStore()
    }, [router])

    const fetchProducts = async () => {
        setFetchingProducts(true);
        try {
            const { data } = await axios.get("/api/products");
            if (data.success) setProducts(data.products);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setFetchingProducts(false);
        }
    };

    useEffect(() => {
        if (store) fetchProducts();
    }, [store]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader />
        </div>
    )
    if (!store) return null

    if (store.status === "frozen") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
                <div className="bg-surface border border-red-200 dark:border-red-900/30 rounded-3xl p-8 sm:p-12 text-center max-w-lg shadow-xl shrink-0 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FiXCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4">Store Suspended</h1>
                    <p className="text-muted-foreground mb-8 text-lg">Your seller account and store have been temporarily frozen by administration. Operations are suspended.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-6 py-3 bg-muted border border-border text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors">
                            Back to Home
                        </Link>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md">
                            Check Status
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col shadow-xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col h-full overflow-y-auto hidden-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            <FiArrowLeft className="w-4 h-4" /> Home
                        </Link>
                        <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-border mb-4 bg-muted shadow-sm">
                            {store.logo ? (
                                <Image src={store.logo} alt={store.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-muted-foreground">{store.name[0]}</div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">{store.name}</h2>
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mt-2">Seller Hub</span>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-2">Store Management</p>
                        
                        <Link href="/store/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-medium shadow-md shadow-primary/20 transition-all">
                            <FiPackage className="w-5 h-5" /> Dashboard & Products
                        </Link>
                        
                        <Link href="/store/sales-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted font-medium transition-all group">
                            <FiBarChart2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> Sales Analytics
                        </Link>
                        
                        <Link href="/store/track-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted font-medium transition-all group">
                            <FiTruck className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> Orders 
                        </Link>
                        
                        <Link href="/store/managestore" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted font-medium transition-all group">
                            <FiSettings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> Settings
                        </Link>
                        
                        <Link href="/seller/chats" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted font-medium transition-all group">
                            <FiMessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> Messages
                        </Link>

                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <button 
                            onClick={() => { setIsSidebarOpen(false); setShowAddModal(true); }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-all shadow-md active:scale-[0.98]"
                        >
                            <FiPlus className="w-5 h-5" /> Add New Product
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                {/* Header */}
                <header className="h-20 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 text-foreground bg-muted rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                            <FiMenu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Inventory</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage and view all items in your store</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/seller/chats" className="relative p-1.5 sm:p-2 bg-muted rounded-full text-foreground hover:bg-muted/80 transition-colors group">
                            <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-primary transition-colors" />
                            <span className="absolute top-0 right-0 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-primary rounded-full border-2 border-surface" />
                        </Link>
                        <div className="bg-primary/10 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm font-black flex items-center gap-1.5 uppercase">
                            <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {products.length} <span className="hidden xs:inline">Items</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 hidden-scrollbar relative bg-background">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="mb-6 sm:mb-8 relative max-w-md">
                        <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            type="text"
                            placeholder="Find items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 bg-surface border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-xs sm:text-sm shadow-sm"
                        />
                    </div>

                    {fetchingProducts ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <FiRefreshCcw className="w-10 h-10 animate-spin mb-4 text-primary" />
                            <p className="font-medium">Loading your inventory...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground bg-surface border border-dashed border-border rounded-2xl">
                                    <FiSearch className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    <p>No matches found.</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-surface border border-border rounded-lg sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                                        <div className="relative w-full aspect-[2/3] sm:aspect-square bg-muted/50 overflow-hidden">
                                            {product.image ? (
                                                <Image 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"  
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                    <FiPackage className="w-6 h-6 sm:w-12 sm:h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-1.5 sm:p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-foreground text-[9px] sm:text-lg mb-0.5 sm:mb-1 truncate uppercase tracking-tight">{product.name}</h3>
                                            <p className="text-muted-foreground text-[8px] sm:text-sm line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-4 flex-1">{product.description}</p>
                                            
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 mb-2 sm:mb-4 pt-1 sm:pt-4 border-t border-border">
                                                <div>
                                                    <p className="text-[7px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest hidden sm:block">Price</p>
                                                    <p className="font-black text-primary text-[10px] sm:text-lg"><span className="text-[7px] sm:hidden mr-0.5">Rs.</span>{product.price.toLocaleString()}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-[7px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest hidden sm:block">Stock</p>
                                                    <p className="font-bold text-foreground text-[8px] sm:text-sm bg-muted sm:bg-transparent px-1 sm:px-0 rounded sm:rounded-none leading-none pt-0.5 sm:pt-0">Qty: {product.quantity}</p>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                disabled={deletingId === product._id}
                                                className="w-full flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2.5 bg-destructive/10 text-destructive font-bold text-[8px] sm:text-medium rounded sm:rounded-lg hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 uppercase tracking-widest"
                                            >
                                                {deletingId === product._id ? <FiRefreshCcw className="w-3 h-3 animate-spin" /> : <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                                                <span className="hidden sm:inline">Delete Product</span>
                                                <span className="inline sm:hidden">Del</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-border rounded-3xl">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <FiPackage className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">No products yet</h3>
                            <p className="text-muted-foreground max-w-sm mb-8">Start adding items to build your store inventory and attract customers.</p>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
                            >
                                <FiPlus className="w-5 h-5" /> Add Your First Product
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => !isSubmitting && setShowAddModal(false)} 
                    />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border flex items-center justify-between bg-muted/30">
                            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-tighter sm:tracking-normal">
                                <FiPlus className="w-5 h-5 text-primary" /> New Item
                            </h2>
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                disabled={isSubmitting}
                                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-8 overflow-y-auto hidden-scrollbar">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Product Image</label>
                                    <label className="block w-full border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl transition-colors cursor-pointer overflow-hidden group">
                                        {preview ? (
                                            <div className="relative w-full aspect-video bg-muted">
                                                <Image src={preview} alt="Preview" fill className="object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2">
                                                    <FiUploadCloud className="w-5 h-5" /> Change
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-6 sm:py-12 flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                                                <FiUploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3" /> 
                                                <span className="font-black uppercase tracking-widest text-[10px] sm:text-sm">Upload Image</span>
                                                <span className="text-[9px] sm:text-xs text-muted-foreground mt-1 uppercase opacity-60">JPEG, PNG, WebP</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            {...register("image", { required: "Product image is required" })}
                                        />
                                    </label>
                                    {errors.image && <p className="text-destructive text-xs mt-1">{errors.image.message}</p>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                                    <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">Name</label>
                                        <input
                                            placeholder="Product title"
                                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-xs sm:text-sm"
                                            {...register("name", { required: "Name is required" })}
                                        />
                                        {errors.name && <p className="text-destructive text-[10px] mt-1 uppercase font-bold">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">Price (PKR)</label>
                                        <input
                                            type="number"
                                            placeholder="1500"
                                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-xs sm:text-sm"
                                            {...register("price", { required: "Price is required", min: { value: 0, message: "Positive only" }, valueAsNumber: true })}
                                        />
                                        {errors.price && <p className="text-destructive text-[10px] mt-1 uppercase font-bold">{errors.price.message}</p>}
                                    </div>
                                    <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">Tagline</label>
                                        <input
                                            placeholder="Max 25 chars"
                                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-xs sm:text-sm"
                                            {...register("description", { required: "Required", maxLength: { value: 25, message: "Max 25" } })}
                                        />
                                        {errors.description && <p className="text-destructive text-[10px] mt-1 uppercase font-bold">{errors.description.message}</p>}
                                    </div>
                                    <div className="space-y-1 sm:space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">In Stock</label>
                                        <input
                                            type="number"
                                            placeholder="50"
                                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-xs sm:text-sm"
                                            {...register("quantity", { required: "Required", min: { value: 1, message: "Min 1" }, valueAsNumber: true })}
                                        />
                                        {errors.quantity && <p className="text-destructive text-[10px] mt-1 uppercase font-bold">{errors.quantity.message}</p>}
                                    </div>
                                </div>
                                
                                <div className="pt-4 mt-4 sm:mt-6 border-t border-border flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pb-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddModal(false)}
                                        disabled={isSubmitting}
                                        className="order-2 sm:order-1 px-6 py-3 border border-border bg-background text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="order-1 sm:order-2 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] flex items-center justify-center disabled:opacity-70 min-w-[140px]"
                                    >
                                        {isSubmitting ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Publish Item"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
