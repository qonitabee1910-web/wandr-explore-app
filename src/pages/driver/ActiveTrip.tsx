import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from '@/components/driver/DriverLayout';
import { useDriver } from '@/context/DriverContext';
import { MapView } from '@/components/ride/MapView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverActiveTrip = () => {
  const { activeTrip, startTrip, completeTrip, driverState } = useDriver();
  const navigate = useNavigate();

  // If no active trip, redirect to dashboard or show empty state
  if (!activeTrip) {
    return (
      <DriverLayout title="Trip Aktif">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Navigation className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black">Tidak Ada Trip Aktif</h3>
            <p className="text-muted-foreground max-w-[250px] mx-auto text-sm">
              Aktifkan status Online untuk mulai menerima pesanan perjalanan.
            </p>
          </div>
          <Button onClick={() => navigate('/driver')} className="rounded-2xl px-8">
            Kembali ke Dashboard
          </Button>
        </div>
      </DriverLayout>
    );
  }

  const isHeadingToPickup = activeTrip.status === 'accepted';
  const isHeadingToDropoff = activeTrip.status === 'started';

  return (
    <DriverLayout title={isHeadingToPickup ? 'Menjemput Penumpang' : 'Mengantar Penumpang'}>
      <div className="space-y-6">
        {/* Map View */}
        <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-background h-[350px]">
          <MapView 
            pickup={isHeadingToPickup ? driverState?.currentLocation : { lat: activeTrip.pickup_latitude, lng: activeTrip.pickup_longitude }}
            destination={isHeadingToPickup ? { lat: activeTrip.pickup_latitude, lng: activeTrip.pickup_longitude } : { lat: activeTrip.dropoff_latitude, lng: activeTrip.dropoff_longitude }}
            className="h-full w-full"
          />
          
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-primary text-primary-foreground border-none px-4 py-2 rounded-full font-black text-xs shadow-lg uppercase tracking-widest">
              {isHeadingToPickup ? 'Menuju Penjemputan' : 'Sedang Dalam Perjalanan'}
            </Badge>
          </div>
        </div>

        {/* Trip Info Card */}
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-background">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeTrip.passenger_id}`} 
                    alt="Passenger" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-black text-lg">John Doe</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">4.9 • {activeTrip.payment_method || 'Cash'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 active:scale-90 transition-transform">
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-1 ${isHeadingToPickup ? 'text-blue-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Penjemputan</p>
                  <p className="font-bold text-sm">{activeTrip.pickup_address}</p>
                </div>
              </div>
              <div className="h-px bg-border/50 ml-8" />
              <div className="flex items-start gap-3">
                <Navigation className={`w-5 h-5 mt-1 ${isHeadingToDropoff ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tujuan</p>
                  <p className="font-bold text-sm">{activeTrip.dropoff_address}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Tarif</p>
                <p className="text-xl font-black text-primary">Rp {activeTrip.total_fare.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jarak</p>
                <p className="text-sm font-black">{activeTrip.distance_km} km</p>
              </div>
            </div>

            <div className="space-y-3">
              {isHeadingToPickup && (
                <Button 
                  onClick={startTrip}
                  className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/30"
                >
                  KONFIRMASI PENJEMPUTAN
                </Button>
              )}
              {isHeadingToDropoff && (
                <Button 
                  onClick={completeTrip}
                  className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-green-500/30 bg-green-500 hover:bg-green-600"
                >
                  SELESAIKAN PERJALANAN
                </Button>
              )}
              <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:underline py-2">
                <AlertTriangle className="w-4 h-4" /> Ada Masalah? Laporkan
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DriverLayout>
  );
};

const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);

export default DriverActiveTrip;
