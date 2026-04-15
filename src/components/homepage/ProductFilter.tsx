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
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-[10px] sm:text-sm font-black transition-all ${isOpen || activeFilterCount > 0
          ? "border-primary bg-primary/5 text-primary shadow-sm"
          : "border-border bg-background text-foreground hover:bg-muted"
          }`}
      >
        <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">Filters</span>
        <span className="xs:hidden">Filter</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1 rounded-full bg-primary text-white text-[9px] sm:text-xs font-black">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed lg:absolute bottom-0 lg:bottom-auto right-0 lg:mt-1 w-full sm:w-80 lg:w-96 bg-background rounded-t-xl lg:rounded-xl shadow-2xl border-t lg:border border-border/40 overflow-hidden z-[60] transform origin-bottom lg:origin-top-right transition-all animate-in slide-in-from-bottom duration-300">
            <div className="p-2 border-b border-border/20 flex items-center gap-2">
              <span className="text-[10px] font-black text-primary flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3 h-3" />
                Filter
              </span>
              <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-bold border transition-all ${selectedCategory === cat
                          ? "bg-primary border-primary text-white"
                          : "bg-muted/30 border-transparent text-muted-foreground"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/40 text-muted-foreground shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-2 space-y-2">
              {/* Controls Row */}
              <div className="grid grid-cols-2 gap-2 items-center">
                <div className="flex gap-0.5">
                   <button
                      onClick={() => setSortByPrice(sortByPrice === 'low-high' ? null : 'low-high')}
                      className={`flex-1 p-1 rounded border transition-all ${sortByPrice === 'low-high' ? "bg-primary border-primary text-white" : "border-border/30 text-muted-foreground"}`}
                      title="Low to High"
                    >
                      <ArrowUpDown className="w-2.5 h-2.5 mx-auto" />
                    </button>
                    <button
                      onClick={() => setSortByPrice(sortByPrice === 'high-low' ? null : 'high-low')}
                      className={`flex-1 p-1 rounded border transition-all ${sortByPrice === 'high-low' ? "bg-primary border-primary text-white" : "border-border/30 text-muted-foreground"}`}
                      title="High to Low"
                    >
                      <ArrowUpDown className="w-2.5 h-2.5 mx-auto rotate-180" />
                    </button>
                    <button
                      onClick={() => setShowMostSold(!showMostSold)}
                      className={`flex-1 p-1 rounded border transition-all ${showMostSold ? "bg-primary border-primary text-white" : "border-border/30 text-muted-foreground"}`}
                      title="Show Bestsellers"
                    >
                      <TrendingUp className="w-2.5 h-2.5 mx-auto" />
                    </button>
                </div>

                <div className="flex gap-0.5 bg-muted/20 p-1 rounded border border-border/10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(selectedRating === star ? null : star)}
                      className={`flex-1 transition-all ${selectedRating && selectedRating >= star ? "text-yellow-500" : "text-muted-foreground opacity-20"}`}
                    >
                      <Star className={`w-2.5 h-2.5 mx-auto ${selectedRating && selectedRating >= star ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Line */}
              <div className="flex items-center gap-3 bg-muted/10 p-1.5 rounded-lg border border-border/10">
                 <span className="text-[8px] font-black text-primary whitespace-nowrap">Max: {currentMaxPrice.toLocaleString()}</span>
                 <input
                  type="range"
                  min="0"
                  max={maxPrice || 100000}
                  step={Math.max((maxPrice || 100000) / 100, 1)}
                  value={currentMaxPrice}
                  onChange={(e) => setCurrentMaxPrice(Number(e.target.value))}
                  className="flex-1 h-0.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Mini Footer */}
            <div className="p-1.5 border-t border-border/20 flex gap-1.5 bg-muted/5">
              <button
                onClick={resetFilters}
                className="flex items-center justify-center h-7 w-7 rounded bg-muted/40 text-muted-foreground"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-primary text-white font-black text-[9px] rounded py-1.5 shadow-sm active:scale-95 transition-all uppercase"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

