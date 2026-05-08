import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-primary pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl border border-brand-border p-8">
            <h1 className="font-display font-bold text-3xl text-white">Blog</h1>
            <p className="text-brand-muted mt-2">
              Blog section is not implemented yet. This is a placeholder page for UI navigation.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

