"use client";

import { useState, useEffect } from "react";
import { Filter, X, ChevronDown, Check, SlidersHorizontal, ArrowUpDown, Star, TrendingUp, RefreshCw } from "lucide-react";

interface ProductFilterProps {
  categories: string[];
  onFilterChange: (filters: any) => void;
  maxPrice: number;
}

export default function ProductFilter({ categories, onFilterChange, maxPrice }: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(maxPrice || 100000);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showMostSold, setShowMostSold] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortByPrice, setSortByPrice] = useState<'low-high' | 'high-low' | null>(null);

  useEffect(() => {
    if (maxPrice > 0 && currentMaxPrice === 0) {
      setCurrentMaxPrice(maxPrice);
    }
  }, [maxPrice]);

  const resetFilters = () => {
    setMinPrice(0);
    setCurrentMaxPrice(maxPrice || 100000);
    setSelectedRating(null);
    setShowMostSold(false);
    setSelectedCategory(null);
    setSortByPrice(null);
  };

  useEffect(() => {
    onFilterChange({
      minPrice,
      maxPrice: currentMaxPrice,
      rating: selectedRating,
      mostSold: showMostSold,
      category: selectedCategory,
      sortByPrice,
    });
  }, [minPrice, currentMaxPrice, selectedRating, showMostSold, selectedCategory, sortByPrice]);

  const activeFilterCount = [
    minPrice > 0,
    currentMaxPrice < (maxPrice || 100000),
    selectedRating !== null,
    showMostSold,
    selectedCategory !== null,
    sortByPrice !== null,
  ].filter(Boolean).length;

  return (
    <div className="relative z-40">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          isOpen || activeFilterCount > 0 
            ? "border-primary bg-primary/5 text-primary shadow-sm" 
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-primary text-white text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-full sm:w-80 lg:w-96 bg-background rounded-2xl shadow-xl border border-border overflow-hidden z-50 transform origin-top-right transition-all">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2 text-foreground">
                <Filter className="w-4 h-4 text-primary" />
                Refine Results
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          selectedCategory === cat 
                            ? "bg-primary border-primary text-white shadow-sm" 
                            : "bg-surface border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Sort */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" /> Sort Price
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSortByPrice(sortByPrice === 'low-high' ? null : 'low-high');
                      if (sortByPrice !== 'low-high') setShowMostSold(false);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                      sortByPrice === 'low-high'
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Low to High
                  </button>
                  <button
                    onClick={() => {
                      setSortByPrice(sortByPrice === 'high-low' ? null : 'high-low');
                      if (sortByPrice !== 'high-low') setShowMostSold(false);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                      sortByPrice === 'high-low'
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    High to Low
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Max Price</label>
                  <span className="text-sm font-semibold text-primary">Rs. {currentMaxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice || 100000}
                  step={Math.max((maxPrice || 100000)/100, 1)}
                  value={currentMaxPrice}
                  onChange={(e) => setCurrentMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rs. 0</span>
                  <span>Rs. {(maxPrice || 100000).toLocaleString()}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4" /> Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(selectedRating === star ? null : star)}
                      className={`flex-1 flex justify-center items-center gap-1 py-1.5 rounded-md border transition-all ${
                        selectedRating === star
                          ? "border-yellow-400 bg-yellow-50 text-yellow-600 font-medium"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {star}<Star className={`w-3 h-3 ${selectedRating === star ? "fill-yellow-500" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Bestsellers */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowMostSold(!showMostSold);
                    if (!showMostSold) setSortByPrice(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    showMostSold 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-surface text-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Show Bestsellers Only
                  </span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${showMostSold ? "bg-primary" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${showMostSold ? "left-5" : "left-1"}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <button 
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset all filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

