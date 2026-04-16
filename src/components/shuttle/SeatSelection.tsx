import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { Badge } from '@/components/ui/badge';
import { Armchair, ArrowLeft, CheckCircle2, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const SeatSelection: React.FC = () => {
  const { state, toggleSeat, prevStep, nextStep } = useShuttle();
  const vehicle = state.selectedVehicle;
  const layout = vehicle?.layout;

  if (!layout) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Kursi</h2>
      </div>
      
      <div className="max-w-md mx-auto">
        {/* Realistic Cabin UI */}
        <div className="relative bg-muted/30 rounded-[3rem] p-8 border-4 border-muted shadow-2xl overflow-hidden">
          {/* Front Windshield */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-400 to-transparent opacity-20 rounded-t-[3rem]" />
          
          {/* Dashboard Area */}
          <div className="flex justify-center mb-10 pt-4">
            <div className="w-full h-2 bg-slate-300 rounded-full opacity-50 max-w-[120px]" />
          </div>

          <div 
            className="grid gap-y-6 gap-x-4 relative z-10"
            style={{ 
              gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` 
            }}
          >
            {layout.seats.map((seat) => {
              if (seat.type === 'empty') {
                return <div key={seat.id} className="aspect-square flex items-center justify-center">
                  <div className="w-1.5 h-full bg-slate-200/50 rounded-full" /> {/* Aisle indicator */}
                </div>;
              }

              const isSelected = state.selectedSeats.includes(seat.id);
              const isDriver = seat.type === 'driver';

              return (
                <motion.div 
                  key={seat.id}
                  whileTap={seat.isAvailable && !isDriver ? { scale: 0.9 } : {}}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-b-4
                    ${isDriver 
                      ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-default' 
                      : isSelected 
                        ? 'bg-primary border-primary-foreground/30 text-white shadow-lg -translate-y-1' 
                        : seat.isAvailable 
                          ? 'bg-white border-slate-200 hover:border-primary text-slate-600 shadow-sm cursor-pointer' 
                          : 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed'}
                  `}
                  onClick={() => seat.isAvailable && !isDriver && toggleSeat(seat.id)}
                >
                  {isDriver ? (
                    <>
                      <CircleDot className="w-8 h-8 animate-pulse" />
                      <p className="text-[8px] font-black mt-1 uppercase tracking-tighter">DRIVER</p>
                    </>
                  ) : (
                    <>
                      <Armchair className={`w-7 h-7 ${isSelected ? 'animate-bounce' : ''}`} />
                      <p className="text-[10px] font-bold mt-1">{seat.label}</p>
                    </>
                  )}
                  
                  {/* Seat availability dot */}
                  {seat.isAvailable && !isDriver && !isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pyu-go-green" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Rear Windshield */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-400 to-transparent opacity-10 rounded-b-[3rem]" />
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white border-2 border-slate-200 shadow-sm" />
            <span className="text-slate-500">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-primary shadow-sm border-b-2 border-primary-foreground/30" />
            <span className="text-slate-500">Pilihan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-slate-50 border-2 border-slate-100" />
            <span className="text-slate-500">Terisi</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4 shadow-inner">
        <div className="flex justify-between items-center">
           <div className="space-y-0.5">
             <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Kursi Terpilih</p>
             <p className="text-lg font-bold text-foreground">{state.selectedSeats.length} Kursi</p>
           </div>
           <div className="text-right space-y-0.5">
             <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Total Bayar</p>
             <p className="text-2xl font-black text-primary">{state.totalPrice.toLocaleString('id-ID')} IDR</p>
           </div>
        </div>
        
        {state.selectedSeats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {state.selectedSeats.map(id => (
              <Badge key={id} className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-xl shadow-sm">
                 No. {layout.seats.find(s => s.id === id)?.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button 
        className="w-full py-8 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" 
        disabled={state.selectedSeats.length === 0}
        onClick={nextStep}
      >
        Konfirmasi Pesanan <CheckCircle2 className="w-6 h-6 ml-2" />
      </Button>
    </motion.div>
  );
};
