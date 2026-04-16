import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle2, QrCode, MapPin, Navigation, Clock, Armchair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export const BookingSuccess: React.FC = () => {
  const { state, resetBooking } = useShuttle();

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-pyu-go-green/20 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-pyu-go-green" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Pembayaran Sukses!</h2>
          <p className="text-muted-foreground text-sm font-medium">Ticket ID: {state.ticketId}</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="bg-primary p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
           <div className="relative z-10 flex flex-col items-center">
             <QrCode className="w-40 h-40 text-white" />
             <p className="text-white/70 text-xs font-bold mt-4 uppercase tracking-[0.3em]">Scan QR saat boarding</p>
           </div>
        </div>
        <CardContent className="p-10 space-y-8">
           <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Rayon</p>
                 <h3 className="text-2xl font-bold text-primary">{state.selectedRayon?.name}</h3>
              </div>
              <div className="text-right space-y-1">
                 <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Destinasi</p>
                 <h3 className="text-2xl font-bold text-foreground flex items-center gap-2 justify-end">
                    <Navigation className="w-5 h-5" /> KNO
                 </h3>
              </div>
           </div>

           <Separator className="bg-muted-foreground/10" />

           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <p className="text-xs uppercase font-bold tracking-widest">Waktu</p>
                 </div>
                 <p className="font-bold text-lg">{state.selectedSchedule?.departureTime} WIB</p>
              </div>
              <div className="space-y-2 text-right">
                 <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <Armchair className="w-4 h-4" />
                    <p className="text-xs uppercase font-bold tracking-widest">Kursi</p>
                 </div>
                 <div className="flex justify-end gap-1 flex-wrap">
                    {state.selectedSeats.map(id => (
                      <Badge key={id} className="bg-primary text-white text-sm px-3 rounded-lg">
                        {state.selectedVehicle?.layout.seats.find(s => s.id === id)?.label}
                      </Badge>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-muted/30 p-6 rounded-3xl space-y-2 border border-muted-foreground/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                 <MapPin className="w-4 h-4 text-primary" />
                 <p className="text-xs uppercase font-bold tracking-widest">Titik Jemput</p>
              </div>
              <p className="font-bold text-sm leading-relaxed">{state.selectedPickupPoint?.name}</p>
           </div>

           <Separator className="bg-muted-foreground/10" />

           <div className="space-y-4">
              <Button className="w-full py-7 rounded-2xl font-bold text-lg bg-pyu-go-green hover:bg-pyu-go-green/90 shadow-xl shadow-pyu-go-green/20">
                 Download Ticket <Download className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="ghost" className="w-full font-bold text-muted-foreground" onClick={resetBooking}>
                 Kembali ke Home
              </Button>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
