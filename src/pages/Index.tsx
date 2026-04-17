import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bus, Car, Star, ArrowRight, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface PromoRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number;
}

const heroBanners = [
  {
    title: "Perjalanan Nyaman Selama Liburan di Medan",
    subtitle: "Shuttle mulai dari Rp 120.000 dengan armada premium",
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=500&fit=crop",
  },
  {
    title: "Ride & Explore Kota",
    subtitle: "Perjalanan aman dan cepat dengan Ride Hailing",
    bg: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=500&fit=crop",
  },
  {
    title: "Promo Spesial Shuttle",
    subtitle: "Diskon hingga 30% untuk pemesanan via aplikasi",
    bg: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=500&fit=crop",
  },
];

const Index = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [promos, setPromos] = useState<PromoRow[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase
      .from("promos")
      .select("id, title, description, image_url, discount_percent")
      .eq("is_active", true)
      .limit(4)
      .then(({ data }) => {
        if (data) setPromos(data as PromoRow[]);
      });
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img src={heroBanners[currentBanner].bg} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20" />
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
                {heroBanners[currentBanner].title}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-primary-foreground/90 mb-6">
                {heroBanners[currentBanner].subtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full font-semibold">
                  <Link to="/shuttle"><Bus className="w-4 h-4 mr-1" /> Cari Shuttle</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-full font-semibold">
                  <Link to="/ride"><Car className="w-4 h-4 mr-1" /> Pesan Ride</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 right-4 flex gap-2 z-10">
          <Button variant="outline" size="icon" className="rounded-full bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20" onClick={prevBanner}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20" onClick={nextBanner}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {heroBanners.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-primary-foreground w-6" : "bg-primary-foreground/50"}`} />
          ))}
        </div>
      </section>

      {/* Quick Search */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-10">
        <Card className="shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/shuttle" className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl border border-border hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Bus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-semibold text-foreground">Shuttle</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Travel antarkota</p>
                </div>
              </Link>
              <Link to="/ride" className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl border border-border hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-semibold text-foreground">Ride</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Ojek & Taksi Online</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rute Populer (static) */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Rute Populer</h2>
          <Link to="/shuttle" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { route: "Jakarta - Bandung (PP)", desc: "Executive • Hiace Premio", price: "Rp 120.000", img: "https://images.unsplash.com/photo-1594132411604-09756157e800?w=800&h=600&fit=crop", rating: "4.9" },
            { route: "Surabaya - Malang", desc: "Semi Executive • Mini Bus", price: "Rp 85.000", img: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=800&h=600&fit=crop", rating: "4.8" },
            { route: "Yogyakarta - Solo", desc: "Regular • Mini Car", price: "Rp 45.000", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop", rating: "4.7" },
          ].map((r) => (
            <Card key={r.route} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img src={r.img} alt={r.route} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground truncate">{r.route}</h3>
                <p className="text-xs text-muted-foreground mb-2">{r.desc}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                  <span className="text-sm font-medium">{r.rating}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">Mulai dari</span>
                  <span className="text-primary font-bold">{r.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Promo (from DB) */}
      {promos.length > 0 && (
        <section className="container mx-auto px-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-pyu-go-orange" /> Promo Terkini
            </h2>
            <Link to="/promos" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {promos.map((promo) => (
              <Link key={promo.id} to="/promos" className="snap-start min-w-[280px] md:min-w-[320px] flex-shrink-0">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {promo.image_url && (
                    <div className="relative h-36">
                      <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {promo.discount_percent}%
                      </div>
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-foreground truncate">{promo.title}</h3>
                    {promo.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
