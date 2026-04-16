import { useState, useEffect, useRef } from "react";
import { Navigation, Calendar, MapPin, ChevronRight, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeoLocation } from "@/types/maps";
import { MapService } from "@/services/mapService";

interface RideSearchProps {
  pickup: GeoLocation | null;
  setPickup: (val: GeoLocation | null) => void;
  destination: GeoLocation | null;
  setDestination: (val: GeoLocation | null) => void;
  rideType: "instant" | "scheduled";
  setRideType: (val: "instant" | "scheduled") => void;
  handleSearch: () => void;
}

export const RideSearch = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  rideType,
  setRideType,
  handleSearch,
}: RideSearchProps) => {
  const [pickupInput, setPickupInput] = useState(pickup?.name || pickup?.address || "");
  const [destInput, setDestInput] = useState(destination?.name || destination?.address || "");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState<'pickup' | 'dest' | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLocationSearch = async (query: string, type: 'pickup' | 'dest') => {
    if (type === 'pickup') setPickupInput(query);
    else setDestInput(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setResults([]);
      return;
    }

    setSearching(type);
    searchTimeout.current = setTimeout(async () => {
      try {
        const locations = await MapService.searchLocation(query);
        setResults(locations);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(null);
      }
    }, 500);
  };

  const selectLocation = (loc: GeoLocation, type: 'pickup' | 'dest') => {
    if (type === 'pickup') {
      setPickup(loc);
      setPickupInput(loc.name || loc.address || "");
    } else {
      setDestination(loc);
      setDestInput(loc.name || loc.address || "");
    }
    setResults([]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <Input 
                value={pickupInput} 
                onChange={(e) => handleLocationSearch(e.target.value, 'pickup')}
                className="pl-9 h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                placeholder="Lokasi jemput"
              />
              {searching === 'pickup' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <Input 
                value={destInput}
                onChange={(e) => handleLocationSearch(e.target.value, 'dest')}
                autoFocus
                className="pl-9 h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                placeholder="Mau ke mana?"
              />
              {searching === 'dest' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
            </div>
          </div>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 border-t pt-4"
              >
                {results.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(loc, searching || (destInput ? 'dest' : 'pickup'))}
                    className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{loc.name || loc.address?.split(',')[0]}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{loc.address}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button 
              variant={rideType === "instant" ? "default" : "outline"} 
              className={`flex-1 rounded-2xl h-11 text-xs font-bold transition-all ${rideType === "instant" ? "shadow-lg shadow-primary/20" : ""}`}
              onClick={() => setRideType("instant")}
            >
              <Navigation className="w-4 h-4 mr-2" /> Instant
            </Button>
            <Button 
              variant={rideType === "scheduled" ? "default" : "outline"} 
              className={`flex-1 rounded-2xl h-11 text-xs font-bold transition-all ${rideType === "scheduled" ? "shadow-lg shadow-primary/20" : ""}`}
              onClick={() => setRideType("scheduled")}
            >
              <Calendar className="w-4 h-4 mr-2" /> Scheduled
            </Button>
          </div>

          <Button 
            className="w-full rounded-2xl py-7 font-black text-xl shadow-xl shadow-primary/20 transition-transform active:scale-95" 
            onClick={handleSearch}
            disabled={!pickup || !destination}
          >
            Cari Driver
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 px-2">
        <h3 className="font-black text-foreground flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Lokasi Terakhir
        </h3>
        <div className="space-y-3">
          {[
            { name: "Bandung Indah Plaza", addr: "Jl. Merdeka No.56, Bandung", lat: -6.9090, lng: 107.6100 },
            { name: "Stasiun Bandung", addr: "Jl. Kebon Kawung, Bandung", lat: -6.9140, lng: 107.6020 },
          ].map((loc, i) => (
            <button 
              key={i} 
              className="w-full flex items-center gap-4 p-4 bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-2xl transition-all text-left shadow-sm group"
              onClick={() => selectLocation({ lat: loc.lat, lng: loc.lng, name: loc.name, address: loc.addr }, 'dest')}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <MapPin className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:text-primary transition-colors">{loc.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{loc.addr}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
