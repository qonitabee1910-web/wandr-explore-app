import { Navigation, Clock, CreditCard, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ride } from "@/types";
import { formatCurrency } from "@/data/dummyData";
import { MapView } from "./MapView";
import { GeoLocation, RouteInfo } from "@/types/maps";

interface RideSelectionProps {
  rides: Ride[];
  pickup: GeoLocation | null;
  destination: GeoLocation | null;
  route: RouteInfo | null;
  setRoute: (route: RouteInfo | null) => void;
  selectedRide: string;
  setSelectedRide: (id: string) => void;
  activeRide: Ride;
  handleConfirm: () => void;
}

export const RideSelection = ({
  rides,
  pickup,
  destination,
  route,
  setRoute,
  selectedRide,
  setSelectedRide,
  activeRide,
  handleConfirm,
}: RideSelectionProps) => {
  const currentDistance = route?.distance || 5;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
      <div className="flex-1 min-h-[300px] mb-6 relative">
        <MapView 
          pickup={pickup} 
          destination={destination} 
          onRouteUpdate={setRoute}
          className="h-full w-full rounded-3xl"
        />
      </div>

      <Card className="border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[40px] rounded-b-none mt-auto -mx-4 overflow-hidden bg-background">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3" />
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div className="w-0.5 h-6 bg-muted-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Penjemputan</p>
                  <p className="font-bold text-sm truncate">{pickup?.name || pickup?.address}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tujuan</p>
                  <p className="font-bold text-sm truncate">{destination?.name || destination?.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-xl">Pilih Layanan</h3>
              <p className="text-xs text-muted-foreground font-medium">Estimasi tiba dalam 5-10 menit</p>
            </div>
            <Badge variant="secondary" className="bg-traveloka-blue-light text-primary border-none font-bold">PROMO AKTIF</Badge>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
            {rides.map((ride) => {
              const totalPrice = ride.basePrice + (ride.pricePerKm * currentDistance);
              const originalPrice = totalPrice * 1.25;
              
              return (
                <button
                  key={ride.id}
                  onClick={() => setSelectedRide(ride.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${
                    selectedRide === ride.id ? "border-primary bg-primary/5 shadow-md" : "border-transparent bg-muted/30"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    <img src={ride.image} alt={ride.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-black text-base">{ride.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {route?.duration || 15} mnt
                      </p>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <p className="text-[11px] text-muted-foreground font-bold">{ride.capacity} Kursi</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-lg text-primary">{formatCurrency(totalPrice)}</p>
                    <p className="text-[10px] text-muted-foreground line-through font-bold">{formatCurrency(originalPrice)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Metode Bayar</p>
                  <p className="text-xs font-black">E-Wallet • Rp 500.000</p>
                </div>
              </div>
              <button className="text-xs text-primary font-black hover:underline px-2 py-1">GANTI</button>
            </div>

            <Button className="w-full py-8 rounded-[24px] font-black text-xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleConfirm}>
              Pesan {activeRide.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
