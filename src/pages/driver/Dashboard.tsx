import React from 'react';
import DriverLayout from '@/components/driver/DriverLayout';
import { useDriver } from '@/context/DriverContext';
import { useUserAuth } from '@/context/UserAuthContext';
import { MapView } from '@/components/ride/MapView';
import RideRequestPopup from '@/components/driver/RideRequestPopup';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Star, Navigation, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverDashboard = () => {
  const { 
    driverState, 
    toggleOnline, 
    incomingRequest, 
    acceptRequest, 
    rejectRequest,
    isLoading 
  } = useDriver();
  const { user } = useUserAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DriverLayout title="Driver Dashboard">
      <div className="space-y-6 pb-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none bg-primary text-primary-foreground rounded-3xl overflow-hidden shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Pendapatan</span>
              </div>
              <p className="text-xl font-black">
                Rp {driverState?.totalEarnings.toLocaleString() || '0'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-background rounded-3xl overflow-hidden shadow-md border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</span>
              </div>
              <p className="text-xl font-black text-primary">
                {(user as any)?.rating || '5.0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Online/Offline Toggle */}
        <Card className={`border-none rounded-[32px] overflow-hidden transition-all duration-500 ${
          driverState?.isOnline ? 'bg-green-500' : 'bg-slate-700'
        } text-white shadow-xl`}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight">
                {driverState?.isOnline ? 'Siap Menerima Pesanan' : 'Anda Sedang Offline'}
              </h3>
              <p className="text-xs font-bold opacity-80">
                {driverState?.isOnline ? 'Lokasi Anda aktif dilacak' : 'Aktifkan untuk mulai bekerja'}
              </p>
            </div>
            <Switch 
              checked={driverState?.isOnline} 
              onCheckedChange={toggleOnline}
              className="scale-150 data-[state=checked]:bg-white data-[state=unchecked]:bg-slate-400"
            />
          </CardContent>
        </Card>

        {/* Map Container */}
        <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-background h-[400px]">
          <MapView 
            pickup={driverState?.currentLocation ? { ...driverState.currentLocation, name: 'Posisi Anda', address: '' } : null}
            destination={null}
            className="h-full w-full"
          />
          
          {/* Map Overlay Status */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className={`${
              driverState?.isOnline ? 'bg-green-500' : 'bg-slate-700'
            } text-white border-none px-4 py-2 rounded-full font-black text-xs shadow-lg uppercase tracking-widest`}>
              {driverState?.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <button className="w-12 h-12 rounded-2xl bg-background shadow-xl flex items-center justify-center text-primary active:scale-90 transition-transform">
              <Navigation className="w-6 h-6 fill-primary/10" />
            </button>
          </div>
        </div>

        {/* Quick Actions/Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background p-4 rounded-3xl border border-border/50 text-center space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Selesai</p>
            <p className="text-lg font-black text-primary">{driverState?.completedTrips || 0}</p>
          </div>
          <div className="bg-background p-4 rounded-3xl border border-border/50 text-center space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Diterima</p>
            <p className="text-lg font-black text-primary">100%</p>
          </div>
          <div className="bg-background p-4 rounded-3xl border border-border/50 text-center space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Dibatalkan</p>
            <p className="text-lg font-black text-primary">0%</p>
          </div>
        </div>
      </div>

      {/* Ride Request Modal */}
      <RideRequestPopup 
        request={incomingRequest}
        onAccept={acceptRequest}
        onReject={rejectRequest}
      />
    </DriverLayout>
  );
};

export default DriverDashboard;
