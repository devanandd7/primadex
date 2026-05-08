"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/mock-products";

const categories = [
  { value: "all", label: "All Products" },
  { value: "saas", label: "SaaS Apps" },
  { value: "iot", label: "IoT Products" },
  { value: "medical", label: "Medical Tech" },
  { value: "education", label: "Education" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];

const types = [
  { value: "all", label: "All Types" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "subscription", label: "Subscription" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts((data.products || []) as Product[]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-primary pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display font-bold text-4xl text-white mb-2">
              All <span className="text-gradient-purple">Products</span>
            </h1>
            <p className="text-brand-muted">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border rounded-xl text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 border border-brand-border rounded-xl text-brand-muted hover:text-white hover:border-brand-accent transition-all text-sm sm:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden sm:block w-52 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-3">
                    Category
                  </h3>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          category === cat.value
                            ? "bg-brand-accent/15 text-brand-accent font-medium"
                            : "text-brand-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-3">
                    Type
                  </h3>
                  <div className="space-y-1">
                    {types.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTypeFilter(t.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          typeFilter === t.value
                            ? "bg-brand-accent/15 text-brand-accent font-medium"
                            : "text-brand-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="sm:hidden fixed inset-0 z-50 bg-brand-primary p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-xl text-white">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} className="text-brand-muted" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Category</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setCategory(cat.value);
                            setShowFilters(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                            category === cat.value
                              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                              : "border-brand-border text-brand-muted"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Type</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {types.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => {
                            setTypeFilter(t.value);
                            setShowFilters(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                            typeFilter === t.value
                              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                              : "border-brand-border text-brand-muted"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="flex-1">
              {/* Category pills - mobile */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:hidden scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      category === cat.value
                        ? "border-brand-accent bg-brand-accent text-white"
                        : "border-brand-border text-brand-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="glass rounded-2xl border border-brand-border overflow-hidden animate-pulse"
                      >
                        <div className="aspect-video bg-brand-surface" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 bg-brand-surface rounded w-1/3" />
                          <div className="h-5 bg-brand-surface rounded w-3/4" />
                          <div className="h-3 bg-brand-surface rounded w-full" />
                          <div className="h-3 bg-brand-surface rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-brand-muted text-lg mb-2">No products found</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setTypeFilter("all");
                    }}
                    className="text-brand-accent hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={{
                        ...product,
                        _id: String(product._id),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

