import Link from "next/link";
import { ArrowRight, Cpu, Globe, Heart, Zap, BookOpen, Shield, Star } from "lucide-react";
export const dynamic = "force-dynamic";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/product/ProductCard";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

const domains = [
  // ... existing domains
  {
    icon: Globe,
    label: "SaaS Applications",
    desc: "Cloud-powered tools built for scale",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Cpu,
    label: "IoT Products",
    desc: "Smart hardware meets intelligent software",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    icon: Heart,
    label: "Medical Tech",
    desc: "Healthcare solutions for the modern age",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
  },
  {
    icon: BookOpen,
    label: "Education Tools",
    desc: "Teaching redefined with AI and design",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: Shield,
    label: "Subscription SaaS",
    desc: "Premium recurring value products",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: Star,
    label: "Custom Solutions",
    desc: "Bespoke builds for unique problems",
    color: "text-brand-gold",
    bg: "bg-brand-gold/10 border-brand-gold/20",
  },
];

export default async function HomePage() {
  let featuredProducts = [];
  try {
    await dbConnect();
    // Use a timeout for the query to prevent long hangs
    featuredProducts = await Product.find({ isFeatured: true, isActive: true })
      .limit(6)
      .lean()
      .maxTimeMS(5000); 
  } catch (error) {
    console.error("Database connection/fetch error on HomePage:", error);
    // Continue with empty products instead of crashing
  }

  const serializedProducts = JSON.parse(JSON.stringify(featuredProducts));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-primary">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden grid-bg">
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-sm font-medium mb-8">
                <Zap size={14} fill="currentColor" />
                All domains. One platform.
              </div>

              {/* Headline */}
              <h1 className="font-display font-800 text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
                Engineering the <span className="text-gradient">Future</span>
                <br />
                Across Every Domain
              </h1>

              <p className="text-brand-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                From SaaS apps to IoT hardware, medical technology to education platforms — Primadex builds products that actually matter.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="px-8 py-3.5 bg-brand-accent hover:bg-brand-accentHover text-white font-semibold rounded-xl transition-all duration-200 hover:glow-accent flex items-center gap-2 group"
                >
                  Explore Products
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/blog"
                  className="px-8 py-3.5 border border-brand-border hover:border-brand-accent text-white font-semibold rounded-xl transition-all duration-200 hover:bg-brand-accent/5"
                >
                  Read Blog
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
              {[
                { label: "Products Built", value: "20+" },
                { label: "Domains Covered", value: "6" },
                { label: "Happy Users", value: "500+" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-5 glass rounded-xl border border-brand-border"
                >
                  <div className="font-display font-bold text-3xl text-white mb-1">{stat.value}</div>
                  <div className="text-brand-muted text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Build */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                What We <span className="text-gradient-purple">Create</span>
              </h2>
              <p className="text-brand-muted text-lg max-w-xl mx-auto">
                Six core domains. Unlimited potential. Every product built with intention.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {domains.map((domain) => (
                <div
                  key={domain.label}
                  className={`p-6 glass glass-hover rounded-2xl border ${domain.bg} flex items-start gap-4`}
                >
                  <div className={`w-11 h-11 rounded-xl ${domain.bg} border flex items-center justify-center flex-shrink-0`}>
                    <domain.icon size={20} className={domain.color} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">{domain.label}</h3>
                    <p className="text-brand-muted text-sm">{domain.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-brand-secondary/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
                    Featured <span className="text-gradient-purple">Products</span>
                  </h2>
                  <p className="text-brand-muted">Our most loved creations</p>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:flex items-center gap-2 text-brand-accent hover:text-white transition-colors font-medium"
                >
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serializedProducts.map((product: any) => (
                  <ProductCard key={String(product._id)} product={product} />
                ))}
              </div>

              <div className="text-center mt-10 sm:hidden">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-brand-accent font-medium"
                >
                  View All Products <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="glass rounded-3xl border border-brand-border p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-brand-gold/5 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">Ready to explore?</h2>
                <p className="text-brand-muted text-lg mb-8">
                  Browse our full product catalog — free downloads, paid tools, and subscription products all in one place.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent hover:bg-brand-accentHover text-white font-semibold rounded-xl transition-all duration-200 hover:glow-accent text-lg group"
                >
                  Browse Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

