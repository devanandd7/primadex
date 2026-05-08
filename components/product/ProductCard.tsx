"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/mock-products";

export default function ProductCard({ product }: { product: Product }) {
  const imageSrc = product.images?.[0];

  const priceLabel =
    product.type === "free"
      ? "Free"
      : product.type === "subscription"
        ? `₹${product.price.toLocaleString()} / mo`
        : product.price
          ? `₹${product.price.toLocaleString()}`
          : "Contact";

  const typeLabel =
    product.type === "free" ? "Free" : product.type === "paid" ? "Paid" : product.type === "subscription" ? "Subscription" : product.type;

  return (
    <Link
      href={`/products/${encodeURIComponent(String(product._id))}`}
      className="group block"
      prefetch
    >
      <div className="glass-hover glass rounded-2xl border border-brand-border overflow-hidden h-full transition-transform duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[16/9] bg-brand-surface">
          {imageSrc ? (
            <Image src={imageSrc} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/25 to-brand-gold/10" />
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2">
            {product.badge && (
              <div className="px-3 py-1 rounded-full text-xs bg-brand-accent/15 border border-brand-accent/20 text-brand-accent">
                {product.badge}
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-white font-display font-800 text-lg line-clamp-1">{product.name}</div>
          </div>

          <div className="text-brand-muted text-sm line-clamp-2">{product.description}</div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-brand-muted text-xs">
              <span className="px-2 py-1 rounded-lg border border-brand-border bg-brand-surface">
                {typeLabel}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">{priceLabel}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

