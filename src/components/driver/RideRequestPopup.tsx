import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, CreditCard, Navigation, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RideRequest {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  total_fare: number;
  distance_km: number;
  duration_minutes: number;
  passenger_name?: string;
}

interface RideRequestPopupProps {
  request: RideRequest | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const RideRequestPopup: React.FC<RideRequestPopupProps> = ({ request, onAccept, onReject }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!request) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  const progressValue = (timeLeft / 30) * 100;

  return (
    <AnimatePresence>
      {request && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-2xl overflow-hidden rounded-[32px]">
              <CardContent className="p-0">
                <div className="bg-primary p-6 text-primary-foreground">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      Permintaan Baru
                    </span>
                    <span className="text-2xl font-black">
                      Rp {request.total_fare.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black">
                    {request.passenger_name || 'Penumpang PYU-GO'}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div className="w-0.5 h-6 bg-muted-foreground/20" />
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jemput</p>
                          <p className="font-bold text-sm truncate">{request.pickup_address}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Antar</p>
                          <p className="font-bold text-sm truncate">{request.dropoff_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Jarak</p>
                        <p className="text-sm font-black">{request.distance_km} km</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimasi</p>
                        <p className="text-sm font-black">{request.duration_minutes} mnt</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Respon Segera</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-2 font-black text-lg"
                      onClick={() => onReject(request.id)}
                    >
                      <X className="mr-2 w-5 h-5" /> TOLAK
                    </Button>
                    <Button
                      className="flex-1 h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/30"
                      onClick={() => onAccept(request.id)}
                    >
                      <Check className="mr-2 w-5 h-5" /> TERIMA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RideRequestPopup;
