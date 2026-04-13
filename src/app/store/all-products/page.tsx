"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiTrash2, FiEdit3, FiPackage, FiX, FiUploadCloud, FiXCircle, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi"
import Loader from "@/src/components/Loader"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"

type ProductFormInputs = {
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: FileList;
}

export default function AllProducts() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [isDeletingAll, setIsDeletingAll] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [showDeleteAllPopup, setShowDeleteAllPopup] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")
    const [showDeletePassword, setShowDeletePassword] = useState(false)

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormInputs>();
    const imageFile = watch("image");
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, [imageFile]);

    const handleUpdateClick = (product: any) => {
        reset()
        setSelectedProduct(product)
        setValue("name", product.name)
        setValue("description", product.description)
        setValue("price", product.price)
        setValue("quantity", product.quantity)
        setPreview(product.image)
        setShowUpdateModal(true)
    }

    const onUpdateSubmit = async (data: ProductFormInputs) => {
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("price", data.price.toString());
            formData.append("quantity", data.quantity.toString());
            if (data.image && data.image.length > 0) formData.append("image", data.image[0]);
            const response = await axios.put(`/api/products/${selectedProduct._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data.success) {
                toast.success("Product updated successfully!");
                setShowUpdateModal(false);
                reset();
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update product");
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchData = async () => {
        try {
            const [storeRes, productsRes] = await Promise.all([
                axios.get("/api/store"),
                axios.get("/api/products")
            ])
            if (storeRes.data.success) setStore(storeRes.data.store)
            if (productsRes.data.success) setProducts(productsRes.data.products)
        } catch (error: any) {
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        try {
            const { data } = await axios.delete(`/api/products/${id}`)
            if (data.success) {
                toast.success("Product deleted")
                setProducts(products.filter(p => p._id !== id))
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Delete failed")
        }
    }

    const handleDeleteAll = () => {
        if (!confirm("CRITICAL: This will delete ALL products in your store. Continue?")) return
        setShowDeleteAllPopup(true)
    }

    const confirmDeleteAll = async () => {
        if (!deletePassword) return toast.error("Please enter your password");
        if (deletePassword.length < 5) return toast.error("Password must be at least 5 characters");
        setIsDeletingAll(true)
        try {
            const { data } = await axios.delete("/api/products/all", { data: { password: deletePassword } })
            if (data.success) {
                toast.success(data.message)
                setProducts([])
                setShowDeleteAllPopup(false)
                setDeletePassword("")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Delete failed")
        } finally {
            setIsDeletingAll(false)
        }
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
                    <h1 className="text-3xl font-bold text-foreground mb-4">Inventory Access Locked</h1>
                    <p className="text-muted-foreground mb-8 text-lg">Your account has been suspended by the administration.</p>
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
                        <p className="text-xs text-muted-foreground">Inventory Management</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap bg-muted/50 px-4 py-2 rounded-xl border border-border w-full sm:w-auto text-center">
                        In Stock: <span className="text-foreground">{products.length}</span>
                    </span>
                    <button 
                        onClick={handleDeleteAll} 
                        disabled={products.length === 0 || isDeletingAll}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-semibold rounded-xl transition-all whitespace-nowrap border border-transparent hover:border-red-600/50 disabled:opacity-50"
                    >
                        <FiTrash2 /> Delete All
                    </button>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col pt-2 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
                                <div className="relative w-full aspect-square bg-muted mx-auto w-[90%] rounded-xl overflow-hidden mt-2">
                                    <Image src={product.image || "https://dummyimage.com/1000x1000"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-foreground text-lg mb-1 truncate">{product.name}</h3>
                                    <div className="flex justify-between items-center mb-4 mt-2">
                                        <p className="font-black text-primary text-xl">Rs. {product.price.toLocaleString()}</p>
                                        <p className="text-sm font-semibold bg-muted px-2 py-1 rounded-md text-foreground border border-border/50">Qty: {product.quantity}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button 
                                            onClick={() => handleUpdateClick(product)}
                                            className="flex items-center justify-center gap-2 py-2.5 border border-border bg-background text-foreground hover:bg-muted font-medium text-sm rounded-lg transition-colors"
                                        >
                                            <FiEdit3 /> Update
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="flex items-center justify-center gap-2 py-2.5 bg-destructive/10 text-destructive font-medium text-sm rounded-lg hover:bg-destructive hover:text-white transition-colors"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface border border-dashed border-border rounded-3xl py-24 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiPackage className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Inventory is empty</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">Go back to add products to your store.</p>
                        <Link href="/store/dashboard" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md">
                            Back to Dashboard
                        </Link>
                    </div>
                )}
            </main>

            {/* Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div onClick={() => !isUpdating && setShowUpdateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Update Product</h2>
                                <p className="text-xs text-muted-foreground mt-1">Modify inventory details</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} disabled={isUpdating} className="p-2 bg-background border border-border rounded-full hover:bg-muted text-muted-foreground transition-colors"><FiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="p-6 sm:p-8 overflow-y-auto hidden-scrollbar space-y-6">
                            <div className="space-y-2 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Product Image</label>
                                <label className="block w-full h-40 border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl transition-colors cursor-pointer overflow-hidden group relative">
                                    {preview ? (
                                        <>
                                            <Image src={preview} alt="Preview" fill className="object-cover opacity-80" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2">
                                                <FiUploadCloud className="w-5 h-5" /> Replace Image
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-[&:hover]:text-primary transition-colors">
                                            <FiUploadCloud className="w-8 h-8 mb-3" />
                                            <span className="font-medium">Click to upload new image</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" {...register("image")} />
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-medium text-foreground">Product Name</label>
                                    <input
                                        placeholder="Product Name"
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                        {...register("name", { required: "Required" })}
                                    />
                                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                    <label className="text-sm font-medium text-foreground">Price (PKR)</label>
                                    <input
                                        type="number"
                                        placeholder="Price in PKR"
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                        {...register("price", { required: "Required", min: { value: 0, message: "Must be non-negative" } })}
                                    />
                                    {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Description (Max 25 chars)</label>
                                <input
                                    placeholder="Short summary..."
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                    {...register("description", { required: "Required", maxLength: { value: 25, message: "Max 25 chars" } })}
                                />
                                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-sm font-medium text-foreground">Quantity</label>
                                <input
                                    type="number"
                                    placeholder="Number of units"
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                    {...register("quantity", { required: "Required", min: { value: 1, message: "Must be positive" } })}
                                />
                                {errors.quantity && <p className="text-destructive text-xs mt-1">{errors.quantity.message}</p>}
                            </div>
                            
                            <div className="pt-4 border-t border-border flex justify-end gap-3 mt-6">
                                <button type="button" disabled={isUpdating} onClick={() => setShowUpdateModal(false)} className="px-6 py-3 border border-border bg-background text-foreground font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUpdating} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 flex items-center justify-center transition-all shadow-md active:scale-[0.98] disabled:opacity-70 min-w-[150px]">
                                    {isUpdating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Update Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete All Confirmation Modal */}
            {showDeleteAllPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div onClick={() => !isDeletingAll && setShowDeleteAllPopup(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-center flex flex-col items-center p-8">
                        <button onClick={() => setShowDeleteAllPopup(false)} disabled={isDeletingAll} className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground"><FiX className="w-5 h-5" /></button>
                        
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FiAlertTriangle className="w-8 h-8" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-foreground mb-2">Security Check</h2>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            Warning: This action is <strong className="text-foreground">irreversible</strong>. All products will be permanently deleted.
                        </p>
                        
                        <div className="w-full space-y-6">
                            <div className="relative text-left focus-within:text-destructive transition-colors">
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Master Password</label>
                                <div className="relative">
                                    <input
                                        type={showDeletePassword ? "text" : "password"}
                                        placeholder="Min 5 characters"
                                        required
                                        minLength={5}
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3.5 outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 transition-all text-foreground font-medium"
                                    />
                                    <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                                        {showDeletePassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="text-right mt-2">
                                    <Link href="/auth/forgetpassword" className="text-primary hover:underline text-sm font-medium">Forgot Password?</Link>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" disabled={isDeletingAll} onClick={() => setShowDeleteAllPopup(false)} className="flex-1 py-3.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="button" onClick={confirmDeleteAll} disabled={isDeletingAll || deletePassword.length < 5} className="flex-1 py-3.5 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                                    {isDeletingAll ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Confirm Purge"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
