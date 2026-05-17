"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, LayoutGrid, Package, Settings, LogOut, 
  ChevronRight, BarChart3, Users, Globe, ExternalLink,
  Edit2, Trash2, Eye, Video,
  Search, Filter, MoreHorizontal
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { IProduct } from "@/lib/models/Product";

// Custom Lucide-styled outline SVG component for LinkedIn
const Linkedin = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export default function AdminDashboard() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?category=all")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Master <span className="text-brand-accent italic font-serif">Control</span></h1>
            <p className="text-white/50 mt-2">Centralized management for the Primadex ecosystem.</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all border border-white/10"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/add-product" className="group">
            <div className="p-6 bg-brand-accent/20 border border-brand-accent/40 rounded-[32px] hover:bg-brand-accent/30 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Package size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-accent/20">
                  <LayoutGrid size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Primadex Assets</h3>
                <p className="text-xs text-white/50 leading-relaxed">Manage products, AI analysis, and asset listings.</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/teachboard" className="group">
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] hover:bg-blue-500/20 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-blue-500">
                <Video size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Video size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">TeachBoard Admin</h3>
                <p className="text-xs text-white/50 leading-relaxed">Control software versions, deployments, and hard updates for desktop users.</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/linkedin" className="group">
            <div className="p-6 bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-[32px] hover:bg-[#0a66c2]/20 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-[#0a66c2]">
                <Linkedin size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#0a66c2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#0a66c2]/20">
                  <Linkedin size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">LinkedIn Publisher</h3>
                <p className="text-xs text-white/50 leading-relaxed">Compose and publish text, image, and video content directly to your professional timeline.</p>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] opacity-40 grayscale relative overflow-hidden h-full cursor-not-allowed">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-white/40" />
              </div>
              <h3 className="text-xl font-bold mb-1 text-white/40">User Management</h3>
              <p className="text-xs text-white/30 leading-relaxed italic">Module coming soon in next release.</p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/5 mb-12" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="text-brand-accent" />
              Product <span className="text-neutral-500 font-light">Inventory</span>
            </h2>
          </div>
          
          <Link 
            href="/admin/add-product"
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/20"
          >
            <Plus size={20} />
            New Asset
          </Link>
        </div>

        {/* Assets List */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <LayoutGrid size={24} className="text-brand-accent" />
              Recent Assets
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/30 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Pricing</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10 text-center text-white/20">Loading assets...</td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="text-white/20 flex flex-col items-center gap-4">
                        <Package size={48} />
                        <p>No assets found. Start by adding a new one.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-bold">{product.name}</div>
                            <div className="text-xs text-white/40 line-clamp-1 max-w-[200px]">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-white/50 border border-white/5">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold">{product.type === "free" ? "Free" : `₹${product.price}`}</div>
                        <div className="text-[10px] text-white/40 uppercase font-bold">{product.type}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/20"}`} />
                          <span className={product.isActive ? "text-green-400" : "text-white/20"}>
                            {product.isActive ? "Active" : "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2.5 bg-white/5 hover:bg-brand-accent/20 hover:text-brand-accent rounded-xl transition-all border border-white/10 group-hover:border-brand-accent/30">
                            <Edit2 size={18} />
                          </button>
                          <Link href={`/products/${product._id}`} className="p-2.5 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl transition-all border border-white/10 group-hover:border-blue-500/30">
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
