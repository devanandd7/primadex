"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, Sparkles, LayoutGrid, CheckCircle2, 
  ExternalLink, Download, Play, Zap, Shield, Cpu,
  ChevronRight, ArrowLeft, ArrowRight, FileText
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ProductDetailsPage({ params }: { params: any }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p: any) => {
      setId(p.id);
      fetchProduct(p.id);
    });
  }, [params]);

  const fetchProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products?id=${productId}`);
      const data = await res.json();
      // Since our API currently returns all products, we find the one we need
      // Better: Update API to handle single product fetch
      const res2 = await fetch("/api/products?category=all");
      const data2 = await res2.json();
      const found = data2.products.find((p: any) => p._id === productId);
      setProduct(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/20 uppercase tracking-widest text-xs font-bold animate-pulse">Loading Asset Architecture...</div>;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <main className="pt-40 pb-20 px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Asset Not Found</h1>
          <p className="text-white/50 mb-8">The requested product could not be found in our database.</p>
          <Link href="/products" className="text-brand-accent hover:underline">Return to Marketplace</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = product.videoUrl ? getYoutubeId(product.videoUrl) : null;
  const allMedia = [...(product.images || [])];
  
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-accent/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5 shadow-2xl group">
              {/* Show Video only on first slide if available and index is 0? 
                  Or just show video as a separate option. 
                  Let's make it a true carousel. */}
              
              <div className="relative w-full h-full">
                <Image 
                  src={allMedia[activeImageIndex]} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-all duration-700" 
                  priority
                />
                
                {/* Navigation Arrows */}
                {allMedia.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-accent hover:border-brand-accent shadow-xl"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-accent hover:border-brand-accent shadow-xl"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </>
                )}

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                  {allMedia.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? "w-8 bg-brand-accent" : "w-1.5 bg-white/20"}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="absolute top-6 left-6 flex gap-2">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                  {product.category}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allMedia.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative flex-shrink-0 w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === i ? "border-brand-accent scale-105" : "border-white/5 opacity-50 hover:opacity-100"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Section if available */}
            {videoId && (
              <div className="pt-8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Play size={14} className="text-brand-accent" /> Multimedia Showcase
                </h3>
                <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Category-Specific Metadata Section */}
            <div className="pt-8 space-y-8">
              {(product.category === "saas" || product.category === "subscription") ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.security && (
                      <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2 flex items-center gap-2">
                          <Shield size={14} /> Security Standards
                        </h4>
                        <p className="text-sm text-white/70 font-medium">{product.security}</p>
                      </div>
                    )}
                    {product.support && (
                      <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Global Support
                        </h4>
                        <p className="text-sm text-white/70 font-medium">{product.support}</p>
                      </div>
                    )}
                  </div>
                  
                  {product.onboarding && (
                    <div className="p-6 rounded-[24px] bg-white/5 border border-white/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Onboarding & Deployment</h4>
                      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{product.onboarding}</p>
                    </div>
                  )}

                  {product.integrations?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                        <LayoutGrid size={14} /> Certified Integrations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.integrations.map((tool: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.compatibility && (
                      <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">Compatibility</h4>
                        <p className="text-sm text-white/70 font-medium">{product.compatibility}</p>
                      </div>
                    )}
                    {product.license && (
                      <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">Asset License</h4>
                        <p className="text-sm text-white/70 font-medium">{product.license}</p>
                      </div>
                    )}
                  </div>

                  {product.techSpecs && (
                    <div className="p-6 rounded-[24px] bg-white/5 border border-white/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Technical Specifications</h4>
                      <p className="text-sm text-white/70 font-medium">{product.techSpecs}</p>
                    </div>
                  )}

                  {product.fileFormats?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Included Formats</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.fileFormats.map((format: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-[10px] font-bold uppercase text-brand-accent">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback to Tech Stack if available for non-SaaS */}
                  {product.techStack?.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                        <Cpu size={14} /> Technology Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.techStack.map((tech: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Narrative Description */}
            <div className="pt-16 mt-8 border-t border-white/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText size={24} className="text-brand-accent" /> Asset Narrative
              </h2>
              <div className="prose prose-invert prose-base text-white/70 leading-[1.8] space-y-4 max-w-none">
                {product.longDescription?.split('\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Blog Post / Marketing Section */}
            {product.blogPost && (
              <div className="pt-16 mt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles size={28} className="text-brand-accent" />
                  <h2 className="text-2xl font-bold text-white">Why Choose {product.name}?</h2>
                </div>
                <div className="prose prose-invert prose-base max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-brand-accent prose-strong:text-white prose-ul:text-white/80 prose-img:rounded-[24px] prose-img:border prose-img:border-white/10 prose-img:shadow-2xl">
                  <ReactMarkdown>{product.blogPost}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Info */}
          <div className="lg:col-span-5 space-y-10">
            <header className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight leading-[1.1]">{product.name}</h1>
              <p className="text-xl text-white/50 leading-relaxed font-medium">{product.description}</p>
            </header>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-8 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">Standard License</span>
                  <div className="text-4xl font-bold">
                    {product.type === "free" ? "Free" : `₹${product.price?.toLocaleString()}`}
                    {product.type === "subscription" && <span className="text-lg text-white/40 font-medium">/mo</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">Support</span>
                  <span className="text-green-400 font-bold flex items-center justify-end gap-1">
                    <Shield size={14} /> Included
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Link 
                  href={product.type === "free" ? (product.downloadUrl || "#") : "#checkout"} 
                  className="w-full py-5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20 active:scale-[0.98]"
                >
                  {product.type === "free" ? <Download size={20} /> : <Zap size={20} />}
                  {product.type === "free" ? "Download Now" : "Secure Purchase"}
                </Link>
                {product.demoUrl && (
                  <Link 
                    href={product.demoUrl}
                    target="_blank"
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10"
                  >
                    <ExternalLink size={20} /> Live Preview
                  </Link>
                )}
              </div>

              <div className="pt-4 flex items-center justify-center gap-8 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-brand-accent" /> Lifetime Access
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-brand-accent" /> verified asset
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <Sparkles size={14} /> Core Capabilities
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {product.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="mt-1 p-1 bg-brand-accent/20 rounded-lg text-brand-accent">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-white/70 font-medium leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Link */}
            {product.docsUrl && (
              <Link 
                href={product.docsUrl}
                className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-white/50 group-hover:text-brand-accent transition-colors">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Documentation</h4>
                    <p className="text-sm text-white/40">Read technical guides & API refs</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-white/20 group-hover:text-white transition-all" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
