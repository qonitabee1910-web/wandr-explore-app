import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { shuttleServices } from '../../data/shuttleModule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const ServiceSelection: React.FC = () => {
  const { state, setService, prevStep } = useShuttle();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Layanan</h2>
      </div>
      <p className="text-sm text-muted-foreground">Rayon: {state.selectedRayon?.name} | Titik Jemput: {state.selectedPickupPoint?.name}</p>
      
      <div className="space-y-4">
        {shuttleServices.map((srv) => (
          <Card 
            key={srv.tier} 
            className={`cursor-pointer hover:border-primary transition-all border-2 ${srv.tier === 'Executive' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => setService(srv)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${srv.tier === 'Executive' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    {srv.tier === 'Executive' ? <Star className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{srv.tier} Service</h3>
                    <p className="text-xs text-muted-foreground">Kualitas layanan premium</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Fasilitas Lengkap</p>
                  <Badge variant={srv.tier === 'Executive' ? 'default' : 'secondary'}>Best Value</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {srv.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-pyu-go-green" /> {amenity}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">Mulai dari</p>
                 <p className="text-xl font-bold text-primary">{(state.selectedRayon?.basePrice || 0) * srv.priceMultiplier} IDR</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
