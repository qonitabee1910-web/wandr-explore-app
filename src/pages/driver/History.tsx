import React, { useEffect, useState } from 'react';
import DriverLayout from '@/components/driver/DriverLayout';
import { useUserAuth } from '@/context/UserAuthContext';
import { rideService } from '@/services/databaseService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Wallet, ChevronRight, Clock } from 'lucide-react';

const DriverHistory = () => {
  const { user } = useUserAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const result = await rideService.getUserRides(user.id, 'driver');
        if (result.success) {
          setRides(result.data || []);
        }
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const totalEarnings = rides.reduce((acc, ride) => acc + (ride.total_fare || 0), 0);

  return (
    <DriverLayout title="Riwayat & Pendapatan">
      <div className="space-y-6">
        {/* Earnings Summary */}
        <Card className="border-none bg-primary text-primary-foreground rounded-[32px] overflow-hidden shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Total Pendapatan</p>
                <h2 className="text-3xl font-black">Rp {totalEarnings.toLocaleString()}</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Trip</p>
                <p className="text-lg font-black">{rides.length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Bulan Ini</p>
                <p className="text-lg font-black">Rp {totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-lg">Perjalanan Terakhir</h3>
            <button className="text-xs font-black text-primary hover:underline">LIHAT SEMUA</button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-background rounded-3xl border border-dashed border-border">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto opacity-20" />
              <p className="text-muted-foreground font-bold">Belum ada riwayat perjalanan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <Card key={ride.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-muted-foreground">
                          {new Date(ride.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase">
                        Selesai
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <p className="text-xs font-bold truncate text-muted-foreground">{ride.pickup_address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <p className="text-xs font-bold truncate text-muted-foreground">{ride.dropoff_address}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <p className="font-black text-primary">Rp {ride.total_fare.toLocaleString()}</p>
                      <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverHistory;
