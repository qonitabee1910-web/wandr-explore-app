import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Bus, Car, Star, ArrowRight, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { hotels, promos, formatCurrency } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

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
            <img
              src={heroBanners[currentBanner].bg}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20" />
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold text-white mb-2"
              >
                {heroBanners[currentBanner].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-white/90 mb-6"
              >
                {heroBanners[currentBanner].subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <Button asChild size="lg" className="rounded-full font-semibold">
                  <Link to="/shuttle">
                    <Bus className="w-4 h-4 mr-1" /> Cari Shuttle
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-full font-semibold bg-white/20 hover:bg-white/30 text-white border-none">
                  <Link to="/ride">
                    <Car className="w-4 h-4 mr-1" /> Pesan Ride
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute bottom-6 right-4 flex gap-2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={prevBanner}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={nextBanner}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentBanner ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Search Tabs */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-10">
        <Card className="shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/shuttle"
                className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-pyu-go-blue-light transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Bus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-semibold text-foreground">Shuttle</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Travel antarkota</p>
                </div>
              </Link>
              <Link
                to="/ride"
                className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-pyu-go-blue-light transition-all group"
              >
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

      {/* Shuttle Populer Section */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Rute Populer</h2>
          <Link to="/shuttle" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1594132411604-09756157e800?w=800&h=600&fit=crop"
                alt="Jakarta - Bandung"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                BEST SELLER
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground truncate">Jakarta - Bandung (PP)</h3>
              <p className="text-xs text-muted-foreground mb-2">Executive Class • Hiace Premio</p>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-xs text-muted-foreground">(2.5k ulasan)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">Mulai dari</span>
                <span className="text-primary font-bold">Rp 120.000</span>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=800&h=600&fit=crop"
                alt="Surabaya - Malang"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground truncate">Surabaya - Malang</h3>
              <p className="text-xs text-muted-foreground mb-2">Semi Executive • Mini Bus</p>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-muted-foreground">(1.8k ulasan)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">Mulai dari</span>
                <span className="text-primary font-bold">Rp 85.000</span>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop"
                alt="Yogyakarta - Solo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground truncate">Yogyakarta - Solo</h3>
              <p className="text-xs text-muted-foreground mb-2">Regular Class • Mini Car</p>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                <span className="text-sm font-medium">4.7</span>
                <span className="text-xs text-muted-foreground">(950 ulasan)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">Mulai dari</span>
                <span className="text-primary font-bold">Rp 45.000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Promo Section */}
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
          {promos.slice(0, 4).map((promo) => (
            <Link
              key={promo.id}
              to="/promos"
              className="snap-start min-w-[280px] md:min-w-[320px] flex-shrink-0"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-36">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {promo.discount}
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm text-foreground truncate">{promo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
