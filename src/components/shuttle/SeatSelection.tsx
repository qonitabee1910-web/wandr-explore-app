/**
 * Dynamic Seat Selection Component
 * Renders the visual seat map for the customer booking flow
 */

import React, { useState, useEffect, useRef } from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { seatLayoutService } from '../../admin/services/seatLayoutService';
import { SeatLayout, Seat } from '../../admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Info, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const SeatSelection: React.FC = () => {
  const { state, toggleSeat, nextStep, prevStep } = useShuttle();
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor container size for scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    updateWidth();

    return () => observer.disconnect();
  }, [layout]);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const { data, error } = await seatLayoutService.getLayouts();
        if (error) throw error;
        
        // Find the published layout
        const published = data?.find(l => l.status === 'published');
        
        if (published) {
          // Fetch full details with seats and categories
          const { data: detail, error: detailError } = await seatLayoutService.getLayoutById(published.id);
          if (detailError) throw detailError;
          
          console.log("Layout loaded:", detail.name, "Base Map URL:", detail.base_map_url ? "Present" : "Missing");
          setLayout(detail);
        } else {
          console.warn("No published seat layout found.");
          // Fallback: If no published layout, check if there are any layouts at all for debugging
          if (data && data.length > 0) {
             console.log("Found layouts but none are published:", data.map(l => `${l.name} (${l.status})`));
          }
        }
      } catch (err) {
        console.error("Failed to load layout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

  if (loading) return <div className="text-center py-20">Memuat denah kursi...</div>;

  if (!layout) return (
    <div className="text-center py-20 space-y-4">
      <Info className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
      <p>Denah kursi belum tersedia untuk kendaraan ini.</p>
      <Button onClick={nextStep}>Lanjutkan Tanpa Pilih Kursi</Button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Kursi</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Visual Map */}
          <div 
            ref={containerRef}
            className="relative bg-muted/20 rounded-[2rem] shadow-xl border overflow-hidden mx-auto flex items-center justify-center"
            style={{ 
              width: '100%', 
              maxWidth: '600px',
              aspectRatio: `${layout.base_width || 4}/${layout.base_height || 3}`,
              backgroundImage: layout.base_map_url ? `url(${layout.base_map_url})` : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: layout.base_map_url ? 'white' : 'transparent'
            }}
          >
            {!layout.base_map_url && (
              <div className="text-center p-8 space-y-2 opacity-30">
                <ImageIcon className="w-12 h-12 mx-auto" />
                <p className="text-xs font-medium">Gambar denah belum diatur oleh admin</p>
              </div>
            )}
            
            {layout.seats?.map((seat) => {
              const isOccupied = state.occupiedSeats.includes(seat.id) || seat.status !== 'available';
              const isSelected = state.selectedSeats.includes(seat.id);
              
              // Calculate scaling ratio based on designer's base width
              const ratio = containerWidth / (layout.base_width || 800);
              const baseSeatSize = 32 * (layout.global_scale || 1.0) * ratio;

              return (
                <button
                  key={seat.id}
                  disabled={isOccupied}
                  onClick={() => toggleSeat(seat.id)}
                  className={`
                    absolute rounded-lg flex items-center justify-center text-[10px] font-bold transition-all
                    ${isSelected 
                      ? 'bg-primary text-white scale-110 shadow-lg ring-4 ring-primary/20 z-10' 
                      : !isOccupied 
                        ? 'bg-white border-2 border-muted-foreground/20 hover:border-primary/50' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}
                  `}
                  style={{
                    left: `${seat.x_pos}%`,
                    top: `${seat.y_pos}%`,
                    transform: 'translate(-50%, -50%)',
                    // Apply dimensions for booking display (relative to 1.0m base)
                    width: `${baseSeatSize * (seat.seat_width || 1.0)}px`,
                    height: `${baseSeatSize * (seat.seat_length || 1.0)}px`,
                    fontSize: `${Math.max(8, 10 * ratio)}px`
                  }}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold">Ringkasan Pilihan</h3>
              <div className="flex flex-wrap gap-2">
                {state.selectedSeats.length > 0 ? (
                  state.selectedSeats.map(id => {
                    const s = layout.seats?.find(st => st.id === id);
                    return (
                      <Badge key={id} className="px-3 py-1 rounded-lg">
                        Kursi {s?.seat_number}
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ada kursi dipilih</p>
                )}
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Total Kursi</span>
                  <span className="font-bold">{state.selectedSeats.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Estimasi Biaya</span>
                  <span>{state.totalPrice.toLocaleString('id-ID')} IDR</span>
                </div>
              </div>

              <Button 
                className="w-full py-6 rounded-2xl font-bold" 
                disabled={state.selectedSeats.length === 0}
                onClick={nextStep}
              >
                Konfirmasi Kursi <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-4 rounded-2xl space-y-3">
             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Legenda</h4>
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                   <div className="w-4 h-4 rounded bg-white border-2" />
                   <span>Tersedia</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                   <div className="w-4 h-4 rounded bg-primary" />
                   <span>Pilihan Anda</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                   <div className="w-4 h-4 rounded bg-muted opacity-50" />
                   <span>Terisi / Tidak Tersedia</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
