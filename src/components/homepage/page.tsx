"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../navbar/page";
import Footer from "../footer/page";
import ProductFilter from "./ProductFilter";
import { useAppDispatch } from "../../redux/hooks";
import { addToCart } from "../../redux/slices/cartSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Search, ShoppingBag, ArrowRight, Star, ShoppingCart, TrendingUp, Heart } from "lucide-react";
import { addToWishlistLocal, removeFromWishlistLocal, setWishlist } from "../../redux/slices/wishlistSlice";
import { useAppSelector } from "../../redux/hooks";
import { useSession } from "next-auth/react";

const getGridItemClass = (index: number) => {
  // Deterministic masonry / bento-grid pattern based on absolute index
  const pattern = index % 14;
  if (pattern === 0) return "sm:col-span-2 sm:row-span-2"; // Large hero feature
  if (pattern === 4) return "sm:col-span-2 sm:row-span-1"; // Wide banner
  if (pattern === 8) return "sm:row-span-2";               // Tall portrait
  if (pattern === 11) return "sm:col-span-2 sm:row-span-2";// Large feature
  return "col-span-1 row-span-1";
};

export default function Homepage() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  interface FilterState {
    minPrice: number;
    maxPrice: number;
    rating: number | null;
    mostSold: boolean;
    mostRated: boolean;
    category: string | null;
    sortByPrice: 'low-high' | 'high-low' | null;
  }

  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 1000000,
    rating: null,
    mostSold: false,
    mostRated: false,
    category: null,
    sortByPrice: null,
  });

  const fetchProducts = async (currentFilters = filters, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (currentFilters.category) params.append("category", currentFilters.category);
      if (currentFilters.minPrice) params.append("minPrice", currentFilters.minPrice.toString());
      if (currentFilters.maxPrice) params.append("maxPrice", currentFilters.maxPrice.toString());
      if (currentFilters.rating) params.append("minRating", currentFilters.rating.toString());

      let sort = "newest";
      if (currentFilters.mostSold) sort = "sold-desc";
      else if (currentFilters.mostRated) sort = "rating-desc";
      else if (currentFilters.sortByPrice === 'low-high') sort = "price-asc";
      else if (currentFilters.sortByPrice === 'high-low') sort = "price-desc";
      params.append("sort", sort);

      const response = await fetch(`/api/marketplace/products?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(1000000);

  // Initial load to get metadata
  useEffect(() => {
    const loadInitialMetadata = async () => {
      try {
        const response = await fetch("/api/marketplace/products");
        const data = await response.json();
        if (data.success) {
          const cats = Array.from(new Set(data.products.map((p: any) => p.category || "General")));
          setAllCategories(cats as string[]);
          const max = data.products.length > 0 ? Math.max(...data.products.map((p: any) => p.price)) : 1000000;
          setAbsoluteMaxPrice(max);
          setProducts(data.products);
        }
        fetchWishlist();
      } catch (err) {
        console.error("Metadata load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialMetadata();
  }, [dispatch]);

  // Update products when search or filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, filters]);

  const filteredProducts = products; // Backend handles filtering now
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/api/wishlist");
      if (response.data.success) {
        dispatch(setWishlist(response.data.data.map((item: any) => ({
          id: item._id,
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          imageUrl: item.productId.image
        }))));
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error("Wishlist fetch failed", err);
      }
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isInWishlist = wishlistItems.some((item) => item.productId === product._id);

    try {
      const res = await axios.post("/api/wishlist", { productId: product._id });
      if (res.data.success) {
        if (isInWishlist || res.data.removed) {
          dispatch(removeFromWishlistLocal(product._id));
        } else {
          dispatch(addToWishlistLocal({
            id: res.data.id || Math.random().toString(),
            productId: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.image
          }));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login to use wishlist");
      } else {
        toast.error("Failed to update wishlist");
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image
    }));

    try {
      const res = await axios.post("/api/cart", { productId: product._id });
      if (res.data.success) {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Just state update if not logged in
        toast.success(`${product.name} temporarily added to cart! Login to save.`);
      } else {
        toast.error(err.response?.data?.error || "Failed to add to cart");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-x-clip">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />

        <div className="container mx-auto max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 zoom-in-95 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:scale-105 transition-transform duration-300 border border-primary/20 shadow-sm cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Season Sale Is Now Live
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            Curated Commerce <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500">
              For The Modern Era
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover a handpicked selection of premium goods from verified global merchants. Elevate your everyday style effortlessly.
          </p>

          <div className="relative max-w-2xl mx-auto flex items-center gap-4 mt-8 bg-background/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] border border-border/60 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-500 overflow-visible z-50">
            <div className="flex-1 flex items-center pl-4 gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, categories, or brands..."
                className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="pr-2">
              <ProductFilter
                categories={allCategories}
                maxPrice={absoluteMaxPrice}
                onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active Filters Display */}
      {(filters.category || filters.rating || filters.mostSold || filters.sortByPrice || (filters.maxPrice < absoluteMaxPrice && filters.maxPrice > 0)) && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 p-3 bg-surface rounded-xl border border-border text-sm">
            <span className="text-muted-foreground font-medium mr-2">Active Filters:</span>
            {filters.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">{filters.category}</span>
            )}
            {filters.rating && (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                {filters.rating}<Star className="w-3 h-3 fill-current" /> & Up
              </span>
            )}
            {filters.mostSold && (
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                <TrendingUp className="w-3 h-3" /> Bestsellers
              </span>
            )}
            <button
              onClick={() => setFilters({
                minPrice: 0,
                maxPrice: absoluteMaxPrice,
                rating: null,
                mostSold: false,
                mostRated: false,
                category: null,
                sortByPrice: null,
              })}
              className="px-3 py-1 text-muted-foreground hover:text-foreground underline underline-offset-4 ml-auto"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 flex-1">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {searchTerm ? "Search Results" : "Featured Selection"}
          </h2>

        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-dense gap-6 auto-rows-[340px]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`flex flex-col gap-3 group bg-surface/50 rounded-3xl p-4 border border-border/50 animate-pulse ${getGridItemClass(i)}`}>
                <div className="w-full flex-1 bg-muted rounded-2xl" />
                <div className="h-5 bg-muted rounded w-3/4 mt-4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/3 mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-surface border border-dashed border-border rounded-3xl">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any items matching your current filters. Try adjusting your search query or removing some filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({ minPrice: 0, maxPrice: absoluteMaxPrice, rating: null, mostSold: false, mostRated: false, category: null, sortByPrice: null });
              }}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-dense gap-6 auto-rows-[340px]">
            {filteredProducts.map((product: any, i: number) => (
              <Link
                href={`/products/productinfo?id=${product._id}`}
                key={product._id}
                style={{ animationDelay: `${(i % 10) * 75}ms` }}
                className={`group flex flex-col bg-background/60 backdrop-blur-lg rounded-3xl overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 transform hover:-translate-y-2 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both ${getGridItemClass(i)}`}
              >
                {/* Image Container */}
                <div className="relative w-full flex-1 bg-muted overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.sold > 50 && (
                      <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md bg-opacity-90">
                        Bestseller
                      </span>
                    )}
                    {product.rating >= 4.5 && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md bg-opacity-90 flex items-center gap-1">
                        Top Rated
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-muted-foreground hover:text-destructive hover:bg-white transition-all shadow-sm group/heart active:scale-90"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${wishlistItems.some(item => item.productId === product._id)
                          ? "fill-destructive text-destructive"
                          : "group-hover/heart:text-destructive"
                        }`}
                    />
                  </button>

                  {/* Quick Add Button (Hover) */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 z-10">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg font-medium py-2.5 rounded-xl border border-white/20 hover:bg-white flex justify-center items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" /> Quick Add
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 truncate">
                    {product.category || "General"}
                  </div>
                  <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 mt-auto pt-2">
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-foreground font-medium">{(product.rating || 0).toFixed(1)}</span>
                    </div>
                    {product.sold > 0 && (
                      <span className="text-xs text-muted-foreground border-l border-border pl-2">
                        {product.sold} sold
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-lg text-foreground">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Modern CTA */}
      {status !== "authenticated" && (
        <section className="relative overflow-hidden py-24 bg-primary text-white mt-12">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Elevate your lifestyle today.</h2>
            <p className="text-primary-foreground/80 md:text-xl max-w-2xl mb-10">
              Join thousands of discerning shoppers and discover the perfect addition to your curated collection.
            </p>
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
            >
              Create Your Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

