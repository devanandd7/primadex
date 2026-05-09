"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl border border-brand-border p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-display font-800 text-white text-lg">Primadex</div>
              <div className="text-brand-muted text-sm mt-1">
                Build, sell, and scale across every domain.
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/products" className="text-brand-muted hover:text-white transition-colors">
                Products
              </Link>
              <Link href="/admin/add-product" className="text-brand-muted hover:text-white transition-colors">
                Add Product
              </Link>
              <Link href="/blog" className="text-brand-muted hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="text-brand-muted hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-brand-muted hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border text-brand-muted text-xs">
            © {new Date().getFullYear()} Primadex. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

