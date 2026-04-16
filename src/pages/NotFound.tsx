import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, Clock, ArrowRight, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // SEO Meta Tags
    document.title = "404 - Coming Soon | PYU-GO";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Halaman ini sedang dalam pengembangan. Sesuatu yang luar biasa akan segera hadir di PYU-GO.");
    }
    
    // Tracking analytics (mocked)
    console.log(`[Analytics] 404/ComingSoon Visit: ${location.pathname} at ${new Date().toISOString()}`);
    
    // Standard 404 response header simulation (for SEO crawlers)
    // Note: In client-side routing, we can't truly send 404 status from JS, 
    // but we can hint it to crawlers via meta tags if needed.
    const metaRobots = document.createElement('meta');
    metaRobots.name = "robots";
    metaRobots.content = "noindex, follow";
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-2xl bg-card/30 backdrop-blur-sm border border-border/50 p-8 md:p-12 rounded-3xl shadow-2xl"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
        >
          <Construction className="w-4 h-4" />
          <span>COMING SOON</span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.3
          }}
          className="relative mb-10 inline-block"
        >
          <div className="text-[100px] md:text-[150px] font-black text-primary/5 select-none leading-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Clock className="w-20 h-20 md:w-28 md:h-28 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
          Sesuatu yang Baru Akan Hadir!
        </h1>
        
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Maaf, halaman <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{location.pathname}</code> belum tersedia saat ini. Tim kami sedang menyiapkan pengalaman terbaik untuk Anda.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-10 font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Ke Beranda
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-10 font-bold text-lg border-2 transition-all hover:bg-muted active:scale-95">
            <Link to="/shuttle">
              <Search className="mr-2 h-5 w-5" /> Cari Shuttle
            </Link>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 pt-8 border-t border-border/50"
        >
          <p className="text-muted-foreground text-sm font-medium mb-4">
            Butuh bantuan mendesak? Jelajahi layanan aktif kami:
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/ride" className="text-primary font-bold hover:underline flex items-center gap-1 group">
              Layanan Ride <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/promos" className="text-primary font-bold hover:underline flex items-center gap-1 group">
              Promo Spesial <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-center w-full px-4"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
          Under Development — PYU-GO v2.0
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;

